<script lang="ts">
	import { MAX_WORD_LENGTH } from '$constants/settings';
	import Tile from '../Tile.svelte';

	const emptyTiles = Array.from(Array(MAX_WORD_LENGTH));
</script>

<div class="tile-row">
	{#each emptyTiles as _}
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
