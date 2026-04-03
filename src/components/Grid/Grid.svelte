<script lang="ts">
	import { Complete, Current, Empty } from './Row';
	import { gameStore } from '$lib/game/stateStore';
	import { currentMaxChallenges } from '$lib/game/gameModeStore';
	import type { CharValue } from '$lib/types';

	export let currentGuess: CharValue[] = [];

	$: emptyRows =
		$gameStore.guesses.length < $currentMaxChallenges - 1
			? Array.from(Array($currentMaxChallenges - 1 - $gameStore.guesses.length))
			: [];
</script>

<div class="game-grid" style="grid-template-rows: repeat({$currentMaxChallenges}, 1fr)">
	{#each $gameStore.guesses as { letters, statuses }}
		<Complete {letters} {statuses} />
	{/each}
	{#if $gameStore.guesses.length < $currentMaxChallenges}
		<Current guess={currentGuess} />
	{/if}
	{#each emptyRows as _, i (i)}
		<Empty />
	{/each}
</div>

<style>
	.game-grid {
		display: grid;
		gap: 5px;
		padding: 0.75rem 0;
	}
</style>
