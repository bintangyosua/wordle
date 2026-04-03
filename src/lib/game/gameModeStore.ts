import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// Signal store that increments when mode changes — allows other components to react
export const modeChangeSignal = writable(0);
import { GAME_MODES, DEFAULT_MODE } from '$constants/settings';
import type { WordLengthMode } from '$lib/types';

const STORAGE_KEY = 'sw-wordLength';

function loadWordLength(): WordLengthMode {
	if (!browser) return DEFAULT_MODE;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored && (stored === '4' || stored === '5' || stored === '6')) {
			return parseInt(stored) as WordLengthMode;
		}
	} catch {
		// ignore
	}
	return DEFAULT_MODE;
}

function createGameModeStore() {
	const { subscribe, set, update } = writable<WordLengthMode>(loadWordLength());

	return {
		subscribe,
		setMode: (mode: WordLengthMode) => {
			if (browser) localStorage.setItem(STORAGE_KEY, String(mode));
			set(mode);
		}
	};
}

export const gameModeStore = createGameModeStore();

export const currentConfig = derived(gameModeStore, ($mode) => GAME_MODES[$mode]);
export const currentWordLength = derived(gameModeStore, ($mode) => GAME_MODES[$mode].wordLength);
export const currentMaxChallenges = derived(gameModeStore, ($mode) => GAME_MODES[$mode].maxChallenges);
