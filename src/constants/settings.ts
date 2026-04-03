import type { WordLengthMode } from '$lib/types';

export const GAME_MODES: Record<WordLengthMode, { wordLength: number; maxChallenges: number; label: string }> = {
	4: { wordLength: 4, maxChallenges: 5, label: '4' },
	5: { wordLength: 5, maxChallenges: 6, label: '5' },
	6: { wordLength: 6, maxChallenges: 8, label: '6' }
};

export const DEFAULT_MODE: WordLengthMode = 5;

export const TILE_ANIMATION_DURATION = 400;
export const TILE_ANIMATION_DELAY = 300;

export function getKeyboardDelay(wordLength: number) {
	return TILE_ANIMATION_DELAY * (wordLength - 1);
}
