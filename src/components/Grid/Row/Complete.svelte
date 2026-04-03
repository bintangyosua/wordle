<script lang="ts">
	import type { CharStatus, CharValue } from '$lib/types';
	import { TILE_ANIMATION_DELAY } from '$constants/settings';
	import Tile from '../Tile.svelte';

	export let letters: CharValue[];
	export let statuses: CharStatus[];
</script>

<div class="tile-row">
	{#each letters as letter, i (`${letter}${statuses[i]}${i}`)}
		<Tile {letter} status={statuses[i]} delay={i * TILE_ANIMATION_DELAY} />
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
