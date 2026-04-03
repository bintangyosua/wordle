<script lang="ts">
	import { currentWordLength } from '$lib/game/gameModeStore';
	import Tile from '../Tile.svelte';

	$: emptyTiles = Array.from(Array($currentWordLength));
</script>

<div class="tile-row" style="grid-template-columns: repeat({$currentWordLength}, 1fr)">
	{#each emptyTiles as _}
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
