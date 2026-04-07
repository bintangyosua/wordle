import { UAParser } from 'ua-parser-js';
import type { Guess, WordLengthMode } from './types';
import { gameStore } from './game/stateStore';
import { get } from 'svelte/store';
import { getSolutionForMode } from './game/helpers';
import { GAME_MODES } from '../constants/settings';
import { gameModeStore } from './game/gameModeStore';

const parser = new UAParser();
const browser = parser.getBrowser();
const device = parser.getDevice();

const webShareApiDeviceTypes = ['mobile', 'smarttv', 'wearable'];

function canShare(data: ShareData) {
	return !!(
		browser.name?.toUpperCase().indexOf('FIREFOX') === -1 &&
		webShareApiDeviceTypes.indexOf(device.type ?? '') !== -1 &&
		navigator.canShare &&
		navigator.canShare(data) &&
		navigator.share
	);
}

export async function svordleShareData(data: ShareData) {
	try {
		if (canShare(data)) {
			await navigator.share(data);
			return true;
		}
		throw 'cannot share';
	} catch (error) {
		return false;
	}
}

export async function svordleWriteClipboardText(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		return false;
	}
}

function generateTiles(isHighContrast: boolean, isDarkMode: boolean) {
	const tiles = new Map<'present' | 'correct' | 'mode', string>();

	tiles.set('correct', isHighContrast ? '🟧' : '🟩');
	tiles.set('present', isHighContrast ? '🟦' : '🟨');
	tiles.set('mode', isDarkMode ? '⬛' : '⬜');
	return tiles;
}

function generateEmojiGrid(tiles: Map<'present' | 'correct' | 'mode', string>, guesses: Guess[]) {
	return guesses
		.map(({ statuses }) => {
			return statuses
				.map((val) => {
					switch (val) {
						case 'correct':
							return tiles.get('correct');
						case 'present':
							return tiles.get('present');
						default:
							return tiles.get('mode');
					}
				})
				.join('');
		})
		.join('\n');
}

export async function shareGameStatus(isHighContrast: boolean, isDarkMode: boolean, lost: boolean) {
	const gameState = get(gameStore);
	const mode = get(gameModeStore);
	const { solutionIndex } = getSolutionForMode(mode);
	const maxChallenges = GAME_MODES[mode].maxChallenges;

	let scoreHeader = `${mode}L #${solutionIndex + 1} ${
		lost ? 'X' : gameState.guesses.length
	}/${maxChallenges}`;

	if (gameState.isHardMode) scoreHeader = `${scoreHeader} *`;

	const dataToShare = {
		title: 'Score',
		text: `${scoreHeader}\n\n${generateEmojiGrid(
			generateTiles(isHighContrast, isDarkMode),
			gameState.guesses
		)}`
	};

	const didShare = await svordleShareData(dataToShare);
	if (didShare) return { didShare, didCopy: false };

	const didCopy = await svordleWriteClipboardText(dataToShare.text);
	return { didShare: false, didCopy };
}
