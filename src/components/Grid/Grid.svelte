<script lang="ts">
	import { MAX_CHALLENGES } from '$constants/settings';
	import { Complete, Current, Empty } from './Row';
	import { gameStore } from '$lib/game/stateStore';
	import type { CharValue } from '$lib/types';

	export let currentGuess: CharValue[] = [];

	$: emptyRows =
		$gameStore.guesses.length < MAX_CHALLENGES - 1
			? Array.from(Array(MAX_CHALLENGES - 1 - $gameStore.guesses.length))
			: [];
</script>

<div class="game-grid">
	{#each $gameStore.guesses as { letters, statuses }}
		<Complete {letters} {statuses} />
	{/each}
	{#if $gameStore.guesses.length < MAX_CHALLENGES}
		<Current guess={currentGuess} />
	{/if}
	{#each emptyRows as _, i (i)}
		<Empty />
	{/each}
</div>

<style>
	.game-grid {
		display: grid;
		grid-template-rows: repeat(6, 1fr);
		gap: 5px;
		padding: 0.75rem 0;
	}
</style>
