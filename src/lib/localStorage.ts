import type { IGameStats, WordLengthMode, IGameHistoryEntry } from './types';

interface IStoredGameState {
	guesses: string[];
	solution?: string;
}

// Mode-specific keys
export function gameStateKey(mode: WordLengthMode) {
	return `sw-gameState-${mode}`;
}
export function statsKey(mode: WordLengthMode) {
	return `sw-gameStats-${mode}`;
}
export function historyKey(mode: WordLengthMode) {
	return `sw-history-${mode}`;
}
const ALL_HISTORY_KEY = 'sw-history-all';

// Legacy keys (for backward compat / debug)
export const legacyGameStateKey = 'sw-gameState';
export const legacyStatsKey = 'sw-gameStats';

export function saveGameState(obj: IStoredGameState, mode: WordLengthMode) {
	localStorage.setItem(gameStateKey(mode), JSON.stringify(obj));
}

export function loadGameState(mode: WordLengthMode): IStoredGameState {
	try {
		const state = localStorage.getItem(gameStateKey(mode));
		if (!state) return { guesses: [] };
		const parsed = JSON.parse(state) as Record<string, unknown>;
		if ('guesses' in parsed) {
			return parsed as unknown as IStoredGameState;
		}
		return { guesses: [] };
	} catch (error) {
		return { guesses: [] };
	}
}

export function saveGameStats(state: IGameStats, mode: WordLengthMode) {
	localStorage.setItem(statsKey(mode), JSON.stringify(state));
}

export function loadStats(defaultShape: IGameStats, mode: WordLengthMode, ...keys: (keyof IGameStats)[]): IGameStats {
	try {
		const stats = localStorage.getItem(statsKey(mode));
		if (!stats) return defaultShape;
		const parsed = JSON.parse(stats) as Record<string, unknown>;
		if (keys.every((k) => k in parsed)) return parsed as unknown as IGameStats;
		return defaultShape;
	} catch (error) {
		return defaultShape;
	}
}

export const hardModeKey = 'sw-hardMode';

export function saveIsHardMode(v: boolean) {
	localStorage.setItem(hardModeKey, v ? '1' : '0');
}

export function loadIsHardMode() {
	try {
		const value = localStorage.getItem(hardModeKey);
		return value === '1';
	} catch (error) {
		return false;
	}
}

// Theme items //
export const highContrastKey = 'sw-highContrast';

export function saveHighContrast(v: boolean) {
	if (v) {
		localStorage.setItem(highContrastKey, '1');
		document.documentElement.classList.add('high-contrast');
	} else {
		localStorage.setItem(highContrastKey, '0');
		document.documentElement.classList.remove('high-contrast');
	}
}

export function loadHighContrast() {
	try {
		const value = localStorage.getItem(highContrastKey);
		return value === '1';
	} catch (error) {
		return false;
	}
}

export const themeKey = 'sw-theme';

export function saveIsDarkMode(v: boolean) {
	if (v) {
		localStorage.setItem(themeKey, 'dark');
		document.documentElement.classList.add('dark');
	} else {
		localStorage.setItem(themeKey, 'light');
		document.documentElement.classList.remove('dark');
	}
}

export function loadIsDarkMode() {
	const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
	try {
		const theme = localStorage.getItem(themeKey);
		return theme ? theme === 'dark' : prefersDarkMode ? true : false;
	} catch (error) {
		return false;
	}
}

// ===== Game History ===== //

const MAX_HISTORY = 100;

export function saveGameHistory(entry: IGameHistoryEntry) {
	try {
		// Save to all-history
		const allRaw = localStorage.getItem(ALL_HISTORY_KEY);
		const all: IGameHistoryEntry[] = allRaw ? JSON.parse(allRaw) : [];
		all.unshift(entry);
		if (all.length > MAX_HISTORY) all.length = MAX_HISTORY;
		localStorage.setItem(ALL_HISTORY_KEY, JSON.stringify(all));

		// Save to mode-specific history
		const modeKey = historyKey(entry.mode);
		const modeRaw = localStorage.getItem(modeKey);
		const modeList: IGameHistoryEntry[] = modeRaw ? JSON.parse(modeRaw) : [];
		modeList.unshift(entry);
		if (modeList.length > MAX_HISTORY) modeList.length = MAX_HISTORY;
		localStorage.setItem(modeKey, JSON.stringify(modeList));
	} catch {
		// ignore
	}
}

export function loadGameHistory(mode?: WordLengthMode): IGameHistoryEntry[] {
	try {
		const key = mode != null ? historyKey(mode) : ALL_HISTORY_KEY;
		const raw = localStorage.getItem(key);
		if (!raw) return [];
		return JSON.parse(raw) as IGameHistoryEntry[];
	} catch {
		return [];
	}
}
