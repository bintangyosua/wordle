import { WORDS as WORDS_5 } from '$constants/wordlist';
import { VALIDGUESSES } from '$constants/validGuesses';
import { WORDS_4 } from '$constants/words4';
import { WORDS_5 as ALL_WORDS_5 } from '$constants/words5';
import { WORDS_6 } from '$constants/words6';
import { addDays, differenceInDays } from 'date-fns';
import type { WordLengthMode } from '$lib/types';

export const WIN_MESSAGES = [
	'Absolute mad lad',
	'Expertly done!',
	'Great job!',
	'Well done',
	'Call it a comeback!',
	'Phew, nice work!',
	'Just in time!',
	'Close call!'
];

function getWordListForMode(mode: WordLengthMode) {
	switch (mode) {
		case 4: return { solutions: WORDS_4, valid: WORDS_4 };
		case 5: return { solutions: WORDS_5, valid: [...WORDS_5, ...VALIDGUESSES, ...ALL_WORDS_5] };
		case 6: return { solutions: WORDS_6.slice(0, 2000), valid: WORDS_6 };
	}
}

function getWordOfTheDay(mode: WordLengthMode) {
	const { solutions } = getWordListForMode(mode);
	const dayOne = new Date('2023-08-16');
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const daysSince = differenceInDays(today, dayOne);
	const tomorrow = addDays(today, 1);

	return {
		tomorrow,
		solutionIndex: daysSince,
		solution: solutions[daysSince % solutions.length].toUpperCase()
	};
}

export function getSolutionForMode(mode: WordLengthMode) {
	return getWordOfTheDay(mode);
}

export function isWordInWordListForMode(word: string, mode: WordLengthMode) {
	const { solutions, valid } = getWordListForMode(mode);
	const lower = word.toLowerCase();
	return solutions.includes(lower) || valid.includes(lower);
}

// Legacy exports for backward compatibility during migration
export const { tomorrow, solution, solutionIndex } = getWordOfTheDay(5);

export const isWinningWord = (word: string, sol?: string) => {
	return (sol ?? solution) === word;
};

export const isWordInWordList = (word: string) => {
	return WORDS_5.includes(word.toLowerCase()) || VALIDGUESSES.includes(word.toLowerCase());
};
