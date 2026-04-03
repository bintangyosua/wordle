<script lang="ts">
	import type { CharStatus, CharValue } from '$lib/types';

	export let kbKey: CharValue | 'ENTER' | 'DELETE';
	export let status: CharStatus | undefined = undefined;
	export let onClick: () => void;
</script>

<button
	class="kb-key"
	class:kb-wide={['ENTER', 'DELETE'].includes(kbKey)}
	class:absent={status === 'absent'}
	class:correct={status === 'correct'}
	class:present={status === 'present'}
	on:click={onClick}
>
	{kbKey}
</button>

<style>
	.kb-key {
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--key-height, 58px);
		min-width: 36px;
		padding: 0 6px;
		margin: 3px;
		border: none;
		border-radius: var(--key-border-radius, 6px);
		background: var(--key-bg);
		color: var(--key-text);
		font-family: var(--font-primary);
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		cursor: pointer;
		touch-action: manipulation;
		user-select: none;
		transition: all 0.15s ease;
	}

	.kb-key:hover {
		filter: brightness(1.15);
		transform: translateY(-1px);
	}
	.kb-key:active {
		transform: translateY(1px) scale(0.97);
		filter: brightness(0.9);
	}

	.kb-wide {
		min-width: 65px;
		font-size: 0.7rem;
		letter-spacing: 0.02em;
	}

	.kb-key.absent {
		background: var(--color-absent);
		color: #ffffff;
		opacity: 0.85;
	}
	.kb-key.absent:hover {
		opacity: 0.95;
	}
	.kb-key.correct {
		background: var(--color-correct);
		color: #ffffff;
	}
	:global(.high-contrast) .kb-key.correct {
		background: var(--color-correct-hc);
	}
	.kb-key.present {
		background: var(--color-present);
		color: #ffffff;
	}
	:global(.high-contrast) .kb-key.present {
		background: var(--color-present-hc);
	}

	@media (min-width: 640px) {
		.kb-key {
			min-width: 43px;
			font-size: 0.875rem;
		}
		.kb-wide {
			min-width: 76px;
			font-size: 0.8rem;
		}
	}
</style>
