import { writable, get } from 'svelte/store';
import { GAME_MODES } from '$constants/settings';
import { browser } from '$app/environment';
import { loadStats, saveGameStats } from '$lib/localStorage';
import type { IGameStats, WordLengthMode } from '$lib/types';
import { gameModeStore } from './gameModeStore';

function defaultStatsForMode(mode: WordLengthMode): IGameStats {
	const maxChallenges = GAME_MODES[mode].maxChallenges;
	return {
		winDistribution: Array.from(new Array(maxChallenges), () => 0),
		gamesFailed: 0,
		currentStreak: 0,
		bestStreak: 0,
		totalGames: 0,
		successRate: 0
	};
}

function loadStatsForMode(mode: WordLengthMode): IGameStats {
	if (!browser) return defaultStatsForMode(mode);
	return loadStats(
		defaultStatsForMode(mode),
		mode,
		'winDistribution',
		'gamesFailed',
		'currentStreak',
		'bestStreak',
		'totalGames',
		'successRate'
	);
}

function createStatStore() {
	const currentMode = get(gameModeStore);
	const init = loadStatsForMode(currentMode);
	const { subscribe, set, update } = writable<IGameStats>(init);

	return {
		subscribe,
		reinitialize: (mode: WordLengthMode) => {
			set(loadStatsForMode(mode));
		},
		calculateStats: (count: number, didWin: boolean, mode: WordLengthMode) => {
			update((gameStats) => {
				const stats = { ...gameStats };
				stats.totalGames += 1;

				if (didWin) {
					// Ensure winDistribution is large enough
					while (stats.winDistribution.length < count) {
						stats.winDistribution.push(0);
					}
					stats.winDistribution[count - 1] += 1;
					stats.currentStreak += 1;

					if (stats.bestStreak < stats.currentStreak) {
						stats.bestStreak = stats.currentStreak;
					}
				} else {
					stats.currentStreak = 0;
					stats.gamesFailed += 1;
				}

				const successRate = Math.round(
					(100 * (stats.totalGames - stats.gamesFailed)) / Math.max(stats.totalGames, 1)
				);
				stats.successRate = successRate;
				if (browser) {
					saveGameStats(stats, mode);
				}
				return stats;
			});
		},
		reset: () => {
			const mode = get(gameModeStore);
			set(defaultStatsForMode(mode));
		}
	};
}

export const statStore = createStatStore();
