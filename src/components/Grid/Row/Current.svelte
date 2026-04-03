<script lang="ts">
	import type { CharValue } from '$lib/types';
	import { currentWordLength } from '$lib/game/gameModeStore';
	import Tile from '../Tile.svelte';

	export let guess: CharValue[];

	$: emptyCells = Array.from(Array($currentWordLength - guess.length));
</script>

<div class="tile-row" style="grid-template-columns: repeat({$currentWordLength}, 1fr)">
	{#each guess as letter}
		<Tile {letter} />
	{/each}
	{#each emptyCells as _}
		<Tile />
	{/each}
</div>

<style>
	.tile-row {
		display: grid;
		gap: 5px;
		justify-items: center;
	}
</style>
