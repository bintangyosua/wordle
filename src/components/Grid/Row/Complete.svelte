<script lang="ts">
	import type { CharStatus, CharValue } from '$lib/types';
	import { TILE_ANIMATION_DELAY } from '$constants/settings';
	import { currentWordLength } from '$lib/game/gameModeStore';
	import Tile from '../Tile.svelte';

	export let letters: CharValue[];
	export let statuses: CharStatus[];
</script>

<div class="tile-row" style="grid-template-columns: repeat({$currentWordLength}, 1fr)">
	{#each letters as letter, i (`${letter}${statuses[i]}${i}`)}
		<Tile {letter} status={statuses[i]} delay={i * TILE_ANIMATION_DELAY} />
	{/each}
</div>

<style>
	.tile-row {
		display: grid;
		gap: 5px;
		justify-items: center;
	}
</style>
