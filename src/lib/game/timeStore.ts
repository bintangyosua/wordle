import { intervalToDuration } from 'date-fns';
import { readable, derived, get } from 'svelte/store';
import { getSolutionForMode } from './helpers';
import { gameModeStore } from './gameModeStore';

function addLeadingZero(time = 0) {
	if (time < 10) {
		return `0${time}`;
	}
	return time;
}

function formatTimeFrame() {
	const mode = get(gameModeStore);
	const { tomorrow } = getSolutionForMode(mode);
	const diff = intervalToDuration({ start: new Date(), end: tomorrow });
	return `${addLeadingZero(diff.hours)}:${addLeadingZero(diff.minutes)}:${addLeadingZero(
		diff.seconds
	)}`;
}

/**
 * September 2nd, 2023
 *
 * currently this causes update events to fire every second, this is probably fine for now but it should be looked in to.
 *
 * just including the value in the dom (even if it doesnt actively render) will show this
 */
export const countdownClock = readable(formatTimeFrame(), (set) => {
	const interval = setInterval(() => {
		set(formatTimeFrame());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
});
