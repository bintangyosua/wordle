<script lang="ts">
	// Adding `|global` to the animations is a requirement. Svelte 4 changed how animatations are localized
	import { TILE_ANIMATION_DURATION } from '$constants/settings';
	import { rotateX } from '$lib/transition';
	import type { CharStatus } from '$lib/types';
	import { backOut } from 'svelte/easing';
	import { scale, type TransitionConfig } from 'svelte/transition';

	export let letter: string | undefined = undefined;
	export let status: CharStatus | undefined = undefined;
	export let heightClass: string | undefined = undefined;
	export let widthClass: string | undefined = undefined;
	export let delay = 1;

	const animate = (node: HTMLElement, args?: { degrees?: number; changeBg?: boolean }) => {
		if (status) {
			return rotateX(node, {
				delay,
				duration: TILE_ANIMATION_DURATION,
				degrees: args?.degrees,
				changeBg: args?.changeBg
			});
		}
		if (letter) return scale(node, { start: 0.9, opacity: 1, easing: backOut, duration: 200 });
		return {} as TransitionConfig;
	};
</script>

<div
	class="game-tile {heightClass ?? ''} {widthClass ?? ''}"
	class:has-letter={!!letter && !status}
	class:absent={status === 'absent'}
	class:correct={status === 'correct'}
	class:present={status === 'present'}
	in:animate|global
	on:introstart={(e) => {
		if (status) {
			e.currentTarget.classList.add('revealing');
		}
	}}
	on:introend={(e) => {
		if (status) {
			e.currentTarget.classList.remove('revealing');
		}
	}}
>
	<div in:animate|global={{ changeBg: false, degrees: -180 }} class="letter-wrapper">
		{letter ?? ''}
	</div>
</div>

<style>
	.game-tile {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--tile-size, 62px);
		height: var(--tile-size, 62px);
		border-radius: var(--tile-border-radius, 6px);
		border: 2px solid var(--border-primary);
		font-size: var(--tile-font-size, 2rem);
		font-weight: 800;
		font-family: var(--font-primary);
		user-select: none;
		transition: border-color 0.15s ease, transform 0.1s ease;
		color: var(--text-primary);
		background: transparent;
	}

	.game-tile.has-letter {
		border-color: var(--border-active);
		animation: pop 0.1s ease;
	}

	.game-tile.absent {
		background: var(--color-absent);
		border-color: var(--color-absent);
		color: #ffffff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}
	.game-tile.correct {
		background: var(--color-correct);
		border-color: var(--color-correct);
		color: #ffffff;
		box-shadow: 0 2px 12px rgba(83, 141, 78, 0.4);
	}
	:global(.high-contrast) .game-tile.correct {
		background: var(--color-correct-hc);
		border-color: var(--color-correct-hc);
		box-shadow: 0 2px 12px rgba(245, 121, 58, 0.4);
	}
	.game-tile.present {
		background: var(--color-present);
		border-color: var(--color-present);
		color: #ffffff;
		box-shadow: 0 2px 12px rgba(181, 159, 59, 0.4);
	}
	:global(.high-contrast) .game-tile.present {
		background: var(--color-present-hc);
		border-color: var(--color-present-hc);
		box-shadow: 0 2px 12px rgba(133, 192, 249, 0.4);
	}

	:is(.game-tile.revealing) {
		border-color: var(--border-active) !important;
		color: var(--text-primary) !important;
		background: transparent !important;
		box-shadow: none !important;
	}

	@keyframes pop {
		0% { transform: scale(1); }
		50% { transform: scale(1.1); }
		100% { transform: scale(1); }
	}
</style>
