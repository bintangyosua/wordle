<script lang="ts">
	import '../app.css';
	const version = __VERSION__;
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import type { WordLengthMode } from '$lib/types';
	import { gameStateKey, saveHighContrast, saveIsDarkMode, statsKey } from '$lib/localStorage';
	import { GAME_MODES } from '$constants/settings';
	import { statStore } from '$lib/game/statStore';
	import { gameStore, overrideSolution } from '$lib/game/stateStore';
	import {
		gameModeStore,
		currentWordLength,
		currentMaxChallenges,
		modeChangeSignal
	} from '$lib/game/gameModeStore';
	import Toggle from '$components/Toggle.svelte';
	import Modal from '$components/Modal.svelte';
	import { keyboardStore } from '$components/Keyboard';
	import { Tile } from '$components/Grid';
	import { toastStore, Toast } from '$components/Toast';
	import { Graph, Transfer, History } from '$components/Stats';
	import { countdownClock } from '$lib/game/timeStore';
	import { shareGameStatus } from '$lib/share';
	import { onDestroy } from 'svelte';

	export let data: LayoutData;

	onDestroy(() => {
		keyboardStore.setDisabled(false);
	});

	$: isHome = $page.url.pathname === '/';
	$: if (isHome && $gameStore.playState !== 'playing') {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
		setTimeout(() => stats.openModal(), 2200);
	}

	let help: Modal;
	let settings: Modal;
	let stats: Modal;
	let about: Modal;
	let transfer: Modal;
	let history: Modal;

	let { isDarkMode, isHighContrast } = data;
	$: if (browser) saveIsDarkMode(isDarkMode);
	$: if (browser) saveHighContrast(isHighContrast);

	let isHardMode = $gameStore.isHardMode;
	$: gameStore.setHardMode(isHardMode);

	const modes: WordLengthMode[] = [4, 5, 6];
	function switchMode(mode: WordLengthMode) {
		if (mode === $gameModeStore) return;
		gameModeStore.setMode(mode);
		gameStore.reinitialize(mode);
		statStore.reinitialize(mode);
		modeChangeSignal.update((n) => n + 1);
	}

	async function showCopyResponse() {
		const { didShare, didCopy } = await shareGameStatus(
			isHighContrast,
			isDarkMode,
			$gameStore.playState === 'lost'
		);
		if (didShare) return;
		if (didCopy) {
			toastStore.show({
				dismissible: false,
				message: 'Score copied to clipboard',
				type: 'info',
				timeout: 2000
			});
			return;
		}
		toastStore.show({
			dismissible: false,
			message: 'Share Operation Incomplete',
			type: 'error',
			timeout: 2000
		});
	}

	function onOpen() {
		keyboardStore.setDisabled(true);
	}

	function onClose() {
		keyboardStore.setDisabled(false);
	}

	function openTransferModal() {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		stats.closeModal();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		transfer.openModal();
	}

	function handlePlayAgain() {
		stats.closeModal();
		gameStore.playAgain();
		modeChangeSignal.update((n) => n + 1);
	}
</script>

{#if $toastStore.length > 0}
	<aside
		class="fixed top-0 right-0 left-0 z-[100001] flex w-full flex-col items-center pt-16"
		data-toast-container
	>
		{#each $toastStore as { dismissible, id, type, message } (id)}
			<Toast {type} {dismissible} on:dismiss={() => toastStore.dismiss(id)}>{message}</Toast>
		{/each}
	</aside>
{/if}

<header class="app-header">
	<section class="flex items-center justify-start pl-2">
		<button class="header-btn" on:click={help.openModal} aria-label="Help">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				fill="currentColor"
				viewBox="0 0 16 16"
			>
				<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
				<path
					d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"
				/>
			</svg>
		</button>
	</section>
	<div class="title-area">
		<h1 class="app-title">Cradle</h1>
		<div class="mode-selector">
			{#each modes as mode}
				<button
					class="mode-btn"
					class:mode-active={$gameModeStore === mode}
					on:click={() => switchMode(mode)}
					aria-label="{mode} letter mode"
				>
					{mode}
				</button>
			{/each}
		</div>
	</div>
	<section class="flex items-center justify-end gap-x-1 pr-2">
		<button class="header-btn" on:click={history.openModal} aria-label="History">
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
				<path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
				<path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
				<path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
			</svg>
		</button>
		<button class="header-btn" on:click={stats.openModal} aria-label="Statistics">
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
				<path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z" />
			</svg>
		</button>
		<button class="header-btn" on:click={settings.openModal} aria-label="Settings">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				fill="currentColor"
				viewBox="0 0 16 16"
			>
				<path
					d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
				/>
				<path
					d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"
				/>
			</svg>
		</button>
	</section>
</header>
<slot />
<footer class="app-footer">
	<span class="footer-version">v{version}</span>
	<span class="footer-divider">·</span>
	<button on:click={about.openModal} class="footer-link">About</button>
</footer>

<!-- MODALS IN HEADER START -->

<!-- HELP MODAL -->
<Modal {onClose} {onOpen} bind:this={help}>
	<h3 slot="header" class="text-center text-lg/6 font-medium">How to play</h3>
	<div class="help">
		<section>
			<p>
				Guess the word in {$currentMaxChallenges} tries. Each guess must be a valid {$currentWordLength}
				letter word.
			</p>
			<p>
				Hit the enter button to submit. You can use the provided onscreen keyboard or a connected
				keyboard.
			</p>
			<p>
				After each guess, the color of the tiles will change to show how close your guess was to the
				word.
			</p>
		</section>
		<hr class="my-3 border-t-2 dark:border-slate-400" />
		<section>
			<div class="demo-row">
				<Tile heightClass="h-12" widthClass="w-12" letter="W" status="correct" />
				<Tile heightClass="h-12" widthClass="w-12" letter="E" />
				<Tile heightClass="h-12" widthClass="w-12" letter="A" />
				<Tile heightClass="h-12" widthClass="w-12" letter="R" />
				<Tile heightClass="h-12" widthClass="w-12" letter="Y" />
			</div>
			<p>
				The letter <strong>W</strong> is in the word and in the correct spot.
			</p>
			<div class="demo-row">
				<Tile heightClass="h-12" widthClass="w-12" letter="P" />
				<Tile heightClass="h-12" widthClass="w-12" letter="I" />
				<Tile heightClass="h-12" widthClass="w-12" letter="L" status="present" />
				<Tile heightClass="h-12" widthClass="w-12" letter="O" />
				<Tile heightClass="h-12" widthClass="w-12" letter="T" />
			</div>
			<p>
				The letter <strong>L</strong> is in the word but in the wrong spot.
			</p>
			<div class="demo-row">
				<Tile heightClass="h-12" widthClass="w-12" letter="V" />
				<Tile heightClass="h-12" widthClass="w-12" letter="A" />
				<Tile heightClass="h-12" widthClass="w-12" letter="G" />
				<Tile heightClass="h-12" widthClass="w-12" letter="U" status="absent" />
				<Tile heightClass="h-12" widthClass="w-12" letter="E" />
			</div>
			<p>
				The letter <strong>U</strong> is not in the word in any spot.
			</p>
		</section>
		<hr class="my-3 border-t-2 dark:border-slate-400" />
		<section>
			<p>A new word will be available to guess every day!</p>
		</section>
	</div>
</Modal>

<!-- SETTINGS MODAL -->
<Modal {onClose} {onOpen} bind:this={settings}>
	<h1 slot="header" class="text-center text-lg/6 font-medium">Settings</h1>
	<div class="settings-list">
		<div class="settings-item">
			<Toggle bind:checked={isDarkMode}>Dark Mode</Toggle>
		</div>
		<div class="settings-item">
			<Toggle bind:checked={isHighContrast}>High Contrast</Toggle>
			<p class="settings-desc">For improved color vision</p>
		</div>
		<div class="settings-item">
			<Toggle bind:checked={isHardMode} disabled={$gameStore.guesses.length > 0}>Hard Mode</Toggle>
			<p class="settings-desc">Revealed hints must be used in subsequent guesses.</p>
			<p class="settings-desc"><strong>Can only be enabled at the start.</strong></p>
		</div>
	</div>
	{#if import.meta.env.DEV}
		<div class="debug-section">
			<button
				class="debug-btn"
				on:click={() => {
					browser && localStorage.removeItem(gameStateKey($gameModeStore));
					gameStore.reset();
					keyboardStore.reset();
					toastStore.show({
						message: '[DEBUG] Game State Reset',
						type: 'info',
						timeout: 2000,
						dismissible: false
					});
					settings.closeModal();
				}}>Reset Game State</button
			>
			<button
				class="debug-btn"
				on:click={() => {
					browser && localStorage.removeItem(statsKey($gameModeStore));
					statStore.reset();
					toastStore.show({
						message: '[DEBUG] Game Stats Reset',
						type: 'info',
						timeout: 2000,
						dismissible: false
					});
					settings.closeModal();
				}}>Reset Game Stats</button
			>
		</div>
	{/if}
</Modal>

<!-- STATS MODAL -->
<Modal {onClose} {onOpen} bind:this={stats}>
	<h3 slot="header" class="modal-title">Statistics</h3>
	<div style="text-align: center;">
		<Graph />
		{#if $gameStore.playState !== 'playing'}
			<div class="stats-endgame">
				{#if !$overrideSolution}
					<div class="countdown-section">
						<div class="countdown-label">Next Word</div>
						<div class="countdown-time">{$countdownClock}</div>
					</div>
				{/if}
				<div class="endgame-actions">
					<button on:click={handlePlayAgain} type="button" class="share-btn">Play Again</button>
					<button on:click={showCopyResponse} type="button" class="share-btn">Share ↗</button>
				</div>
			</div>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		<div class="transfer-footer">
			<span class="transfer-hint">Transfer stats to a new device</span>
			<button on:click={openTransferModal} class="transfer-btn">Transfer</button>
		</div>
	</svelte:fragment>
</Modal>

<!-- TRANSFER MODAL -->
<Modal {onClose} {onOpen} bind:this={transfer}>
	<h3 slot="header" class="text-center text-lg/6 font-medium">Transfer your statistics</h3>
	<Transfer />
</Modal>

<!-- MODALS IN HEADER END -->

<!-- HISTORY MODAL -->
<Modal {onClose} {onOpen} bind:this={history}>
	<h3 slot="header" class="modal-title">Game History</h3>
	<History />
</Modal>

<!-- MODALS IN FOOTER START -->

<!-- ABOUT MODAL -->
<Modal {onClose} {onOpen} bind:this={about}>
	<h3 slot="header" class="modal-title">Cradle {version}</h3>
	<div class="about-content">
		<p>A word-guessing game inspired by Wordle, built with SvelteKit.</p>
		<p>Supports 4, 5, and 6 letter word modes. A new word is available every day for each mode.</p>
		<a
			href="https://www.nytimes.com/games/wordle/index.html"
			target="_blank"
			rel="noopener noreferrer"
			class="about-link"
		>
			Play the official Wordle →
		</a>
	</div>
</Modal>

<!-- MODALS IN FOOTER END -->

<style lang="postcss">
	@reference "../app.css";

	/* ===== Header ===== */
	.app-header {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: 0.5rem 0.25rem;
		border-bottom: 1px solid var(--border-primary);
		background: var(--bg-secondary);
		position: relative;
		z-index: 10;
	}

	.app-title {
		font-size: 1.75rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-align: center;
		background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		user-select: none;
	}

	.title-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.mode-selector {
		display: flex;
		gap: 2px;
		background: var(--bg-tertiary);
		border-radius: 8px;
		padding: 2px;
	}
	.mode-btn {
		padding: 2px 10px;
		border-radius: 6px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.7rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		line-height: 1.4;
	}
	.mode-btn:hover {
		color: var(--text-primary);
	}
	.mode-btn.mode-active {
		background: var(--color-accent);
		color: white;
		box-shadow: 0 1px 4px rgba(99, 102, 241, 0.3);
	}

	@media (min-width: 640px) {
		.app-title {
			font-size: 2rem;
		}
	}

	.header-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 10px;
		color: var(--text-secondary);
		transition: all 0.2s ease;
		cursor: pointer;
		border: none;
		background: transparent;
	}
	.header-btn:hover {
		color: var(--text-primary);
		background: var(--bg-tertiary);
		transform: scale(1.08);
	}
	.header-btn:active {
		transform: scale(0.95);
	}
	.header-btn > svg {
		fill: currentColor;
	}

	/* ===== Footer ===== */
	.app-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		font-size: 0.75rem;
		color: var(--text-muted);
		border-top: 1px solid var(--border-primary);
		background: var(--bg-secondary);
	}
	.footer-version {
		font-weight: 600;
		opacity: 0.6;
	}
	.footer-divider {
		opacity: 0.3;
	}
	.footer-link {
		color: var(--color-accent);
		font-weight: 600;
		border: none;
		background: none;
		cursor: pointer;
		transition: color 0.2s ease;
	}
	.footer-link:hover {
		color: var(--color-accent-hover);
		text-decoration: underline;
	}

	/* ===== Help modal ===== */
	.help p {
		@apply mb-4 text-sm;
		color: var(--text-secondary);
		line-height: 1.6;
	}
	.demo-row {
		@apply mb-1 flex items-center justify-start gap-1;
	}

	/* ===== Modal titles ===== */
	.modal-title {
		font-size: 1rem;
		font-weight: 700;
		text-align: center;
		letter-spacing: 0.02em;
	}

	/* ===== Settings ===== */
	.settings-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	.settings-item {
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--border-primary);
	}
	.settings-item:last-child {
		border-bottom: none;
	}
	.settings-desc {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
	}
	.debug-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-primary);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}
	.debug-btn {
		padding: 0.4rem 1rem;
		border-radius: 8px;
		border: 1px solid var(--color-accent);
		background: transparent;
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.debug-btn:hover {
		background: var(--color-accent);
		color: white;
	}

	/* ===== Stats endgame ===== */
	.stats-endgame {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-primary);
	}
	.countdown-section {
		text-align: center;
	}
	.countdown-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}
	.countdown-time {
		font-family: 'Courier New', monospace;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		color: var(--text-primary);
	}
	.share-btn {
		padding: 0.6rem 2rem;
		border-radius: 10px;
		border: none;
		background: var(--color-correct);
		color: white;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(83, 141, 78, 0.4);
	}
	.share-btn:hover {
		filter: brightness(1.1);
		transform: translateY(-1px);
	}

	/* ===== Endgame action buttons ===== */
	.endgame-actions {
		display: flex;
		gap: 0.75rem;
	}

	/* ===== Transfer footer ===== */
	.transfer-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-primary);
	}
	.transfer-hint {
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	.transfer-btn {
		padding: 0.4rem 1rem;
		border-radius: 8px;
		border: none;
		background: var(--color-accent);
		color: white;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.transfer-btn:hover {
		background: var(--color-accent-hover);
	}

	/* ===== About ===== */
	.about-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.about-content p {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.6;
	}
	.about-link-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		background: var(--bg-tertiary);
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.85rem;
		text-decoration: none;
		transition: all 0.2s ease;
		width: fit-content;
	}
	.about-link-btn:hover {
		background: var(--bg-elevated);
		transform: translateY(-1px);
	}
	.about-link {
		color: var(--color-accent);
		font-weight: 600;
		font-size: 0.85rem;
		text-decoration: none;
		transition: color 0.2s ease;
	}
	.about-link:hover {
		color: var(--color-accent-hover);
		text-decoration: underline;
	}
</style>
