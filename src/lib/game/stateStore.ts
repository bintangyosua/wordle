import type { CharValue, CharStatus, IGameStore, WordLengthMode } from '$lib/types';
import { writable, get } from 'svelte/store';
import { TILE_ANIMATION_DURATION, GAME_MODES, getKeyboardDelay } from '$constants/settings';
import { getSolutionForMode, getRandomSolutionForMode, isWinningWord } from './helpers';
import { statStore } from './statStore';
import { browser } from '$app/environment';
import { loadGameState, loadIsHardMode, saveGameState, saveIsHardMode, gameStateKey } from '$lib/localStorage';
import { keyboardStore } from '$components/Keyboard';
import { toastStore } from '$components/Toast';
import { gameModeStore } from './gameModeStore';

// Override solution store: when set, this takes priority over the daily word
export const overrideSolution = writable<string | null>(null);

export function getCurrentSolution(mode: WordLengthMode): string {
	const override = get(overrideSolution);
	if (override) return override;
	return getSolutionForMode(mode).solution;
}

function helper(letters: CharValue[], solution: string) {
	const splitSolution = solution.split('');
	const usedSolutionCharacters = splitSolution.map(() => false);
	const statuses = Array.from(Array(letters.length)) as CharStatus[];

	letters.forEach((letter, index) => {
		if (letter === splitSolution[index]) {
			statuses[index] = 'correct';
			usedSolutionCharacters[index] = true;
			return;
		}
	});

	letters.forEach((letter, index) => {
		if (statuses[index]) return;
		if (!splitSolution.includes(letter)) {
			statuses[index] = 'absent';
			return;
		}
		const indexOfPresentChar = splitSolution.findIndex(
			(char, i) => char === letter && !usedSolutionCharacters[i]
		);
		if (indexOfPresentChar > -1) {
			statuses[index] = 'present';
			usedSolutionCharacters[indexOfPresentChar] = true;
			return;
		}
		statuses[index] = 'absent';
		return;
	});
	return { letters, statuses };
}

function initializeStoreData(mode: WordLengthMode): IGameStore {
	const solution = getCurrentSolution(mode);
	const maxChallenges = GAME_MODES[mode].maxChallenges;

	const gameState: IGameStore = {
		playState: 'playing',
		guesses: [],
		isHardMode: false,
		hardModeError: false
	};

	if (!browser) return gameState;

	gameState.isHardMode = loadIsHardMode();

	const localState = loadGameState(mode);
	if (!localState.solution || localState.solution !== solution) return gameState;

	const isGameWon = localState.guesses.includes(solution);
	const isGameLost = localState.guesses.length === maxChallenges && !isGameWon;
	if (isGameWon) gameState.playState = 'won';
	if (isGameLost) gameState.playState = 'lost';

	gameState.guesses = localState.guesses.map((g) => {
		const guess = helper(g.split('') as CharValue[], solution);
		keyboardStore.setLetterStatus(guess);
		return guess;
	});

	return gameState;
}

function createGameStore() {
	const currentMode = get(gameModeStore);
	const init = initializeStoreData(currentMode);
	const { subscribe, update, set } = writable<IGameStore>(init);

	return {
		subscribe,
		reinitialize: (mode: WordLengthMode) => {
			overrideSolution.set(null);
			keyboardStore.reset();
			const newState = initializeStoreData(mode);
			set(newState);
		},
		reset: () =>
			set({ playState: 'playing', guesses: [], isHardMode: false, hardModeError: false }),
		playAgain: () => {
			const mode = get(gameModeStore);
			// Pick a random word, excluding the current solution
			const currentSol = getCurrentSolution(mode);
			const newSolution = getRandomSolutionForMode(mode, [currentSol]);
			overrideSolution.set(newSolution);
			// Clear localStorage for this mode so old state doesn't leak
			if (browser) {
				localStorage.removeItem(gameStateKey(mode));
			}
			keyboardStore.reset();
			set({ playState: 'playing', guesses: [], isHardMode: loadIsHardMode(), hardModeError: false });
		},
		setHardMode: (val: boolean) => {
			update((state) => {
				state.isHardMode = val;
				if (browser) saveIsHardMode(val);
				return state;
			});
		},
		hardModeHelper: (guess: CharValue[]) => {
			update((state) => {
				if (!state.isHardMode) return state;
				state.hardModeError = false;
				for (const { letters, statuses } of state.guesses) {
					for (let i = 0; i < letters.length; i++) {
						const letter = letters[i];
						const status = statuses[i];
						if (status === 'correct' && letter !== guess[i]) {
							toastStore.show({
								message: `Needs ${letter} at position ${i + 1}`,
								timeout: 3000,
								dismissible: false,
								type: 'error'
							});
							state.hardModeError = true;
							break;
						}
					}
					if (state.hardModeError) break;
					for (let i = 0; i < letters.length; i++) {
						const letter = letters[i];
						const status = statuses[i];
						if (status === 'present' && !guess.includes(letter)) {
							toastStore.show({
								message: `Needs ${letter}`,
								timeout: 3000,
								dismissible: false,
								type: 'error'
							});
							state.hardModeError = true;
							break;
						}
					}
					if (state.hardModeError) break;
				}
				return state;
			});
		},
		addGuess: (guess: CharValue[]) => {
			const mode = get(gameModeStore);
			const solution = getCurrentSolution(mode);
			update((state) => {
				state.hardModeError = false;
				const guessWithStatus = helper(guess, solution);
				state.guesses.push(guessWithStatus);
				if (browser) {
					saveGameState({ solution, guesses: state.guesses.map((s) => s.letters.join('')) }, mode);
				}
				return state;
			});
		},
		determineGameState: () => {
			const mode = get(gameModeStore);
			const solution = getCurrentSolution(mode);
			const maxChallenges = GAME_MODES[mode].maxChallenges;
			const wordLength = GAME_MODES[mode].wordLength;
			const RESPONSE_TIMEOUT = getKeyboardDelay(wordLength) + TILE_ANIMATION_DURATION;

			update((state) => {
				const lastItem = state.guesses.at(-1);

				setTimeout(() => keyboardStore.setLetterStatus(lastItem!), RESPONSE_TIMEOUT);
				setTimeout(() => keyboardStore.setDisabled(false), RESPONSE_TIMEOUT + 50);

				if (isWinningWord(lastItem!.letters.join(''), solution)) {
					statStore.calculateStats(state.guesses.length, true, mode);
					setTimeout(() => update((s) => ({ ...s, playState: 'won' })), RESPONSE_TIMEOUT);
					return state;
				}
				if (state.guesses.length === maxChallenges) {
					statStore.calculateStats(state.guesses.length, false, mode);
					setTimeout(() => update((s) => ({ ...s, playState: 'lost' })), RESPONSE_TIMEOUT);
				}
				return state;
			});
		}
	};
}

export const gameStore = createGameStore();
