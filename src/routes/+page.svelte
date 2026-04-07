<script lang="ts">
	import { Grid } from '../components/Grid';
	import { Keyboard } from '../components/Keyboard';
	import { toastStore } from '../components/Toast';
	import { WIN_MESSAGES, getSolutionForMode } from '$lib/game/helpers';
	import { gameStore, overrideSolution } from '$lib/game/stateStore';
	import { gameModeStore, modeChangeSignal } from '$lib/game/gameModeStore';
	import type { CharValue } from '$lib/types';

	let currentGuess: CharValue[] = [];

	// Reset currentGuess when mode changes
	$: if ($modeChangeSignal) {
		currentGuess = [];
	}

	$: currentSolution = $overrideSolution ?? getSolutionForMode($gameModeStore).solution;

	$: {
		if ($gameStore.playState === 'won') {
			toastStore.show({
				dismissible: false,
				message: WIN_MESSAGES[$gameStore.guesses.length - 1],
				id: 'wintoast',
				timeout: 2000
			});
		} else if ($gameStore.playState === 'lost') {
			toastStore.show({
				dismissible: false,
				message: `The word was ${currentSolution}`,
				type: 'error',
				id: 'losetoast',
				timeout: 2000
			});
		}
	}
</script>

<svelte:head>
	<title>Svordle Two</title>
	<meta name="description" content="An updated wordle clone rebuilt with svelte" />
	<meta name="og:title" content="Svordle Two" />
	<meta name="og:description" content="An updated wordle clone rebuilt with svelte" />
	<meta name="og:site_name" content="Svordle Two" />
	<meta property="og:type" content="website" />
</svelte:head>

<main class="game-area">
	<Grid {currentGuess} />
	<Keyboard bind:currentGuess />
</main>

<style>
	.game-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		flex: 1;
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
		padding: 0 0.5rem;
		overflow: hidden;
	}
</style>
