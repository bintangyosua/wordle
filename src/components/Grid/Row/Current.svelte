<script lang="ts">
	import type { CharValue } from '$lib/types';
	import { MAX_WORD_LENGTH } from '$constants/settings';
	import Tile from '../Tile.svelte';

	export let guess: CharValue[];

	$: emptyCells = Array.from(Array(MAX_WORD_LENGTH - guess.length));
</script>

<div class="tile-row">
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
		grid-template-columns: repeat(5, 1fr);
		gap: 5px;
		justify-items: center;
	}
</style>
