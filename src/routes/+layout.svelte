<script lang="ts">
	import '../app.css';
	const version = __VERSION__;
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import { gameStateKey, saveHighContrast, saveIsDarkMode, statsKey } from '$lib/localStorage';
	import { MAX_CHALLENGES, MAX_WORD_LENGTH } from '$constants/settings';
	import { statStore } from '$lib/game/statStore';
	import { gameStore } from '$lib/game/stateStore';
	import Toggle from '$components/Toggle.svelte';
	import Modal from '$components/Modal.svelte';
	import { keyboardStore } from '$components/Keyboard';
	import { Tile } from '$components/Grid';
	import { toastStore, Toast } from '$components/Toast';
	import { Graph, Transfer } from '$components/Stats';
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

	let { isDarkMode, isHighContrast } = data;
	$: if (browser) saveIsDarkMode(isDarkMode);
	$: if (browser) saveHighContrast(isHighContrast);

	let isHardMode = $gameStore.isHardMode;
	$: gameStore.setHardMode(isHardMode);

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
</script>

{#if $toastStore.length > 0}
	<aside
		class="fixed left-0 right-0 top-0 z-[100001] flex w-full flex-col items-center pt-16"
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
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
				<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
				<path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
			</svg>
		</button>
	</section>
	<h1 class="app-title">Svordle</h1>
	<section class="flex items-center justify-end gap-x-1 pr-2">
		<button class="header-btn" on:click={stats.openModal} aria-label="Statistics">
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
				<path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z" />
			</svg>
		</button>
		<button class="header-btn" on:click={settings.openModal} aria-label="Settings">
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
				<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
				<path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
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
				Guess the word in {MAX_CHALLENGES} tries. Each guess must be a valid {MAX_WORD_LENGTH} letter
				word.
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
			<button class="debug-btn" on:click={() => { browser && localStorage.removeItem(gameStateKey); gameStore.reset(); keyboardStore.reset(); toastStore.show({ message: '[DEBUG] Game State Reset', type: 'info', timeout: 2000, dismissible: false }); settings.closeModal(); }}>Reset Game State</button>
			<button class="debug-btn" on:click={() => { browser && localStorage.removeItem(statsKey); statStore.reset(); toastStore.show({ message: '[DEBUG] Game Stats Reset', type: 'info', timeout: 2000, dismissible: false }); settings.closeModal(); }}>Reset Game Stats</button>
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
				<div class="countdown-section">
					<div class="countdown-label">Next Word</div>
					<div class="countdown-time">{$countdownClock}</div>
				</div>
				<button on:click={showCopyResponse} type="button" class="share-btn">Share ↗</button>
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

<!-- MODALS IN FOOTER START -->

<!-- ABOUT MODAL -->
<Modal {onClose} {onOpen} bind:this={about}>
	<h3 slot="header" class="modal-title">Svordle {version}</h3>
	<div class="about-content">
		<p>Built to learn Svelte, rebuilt with SvelteKit in 2023.</p>
		<p>The code is open source and available on GitHub:</p>
		<a href="https://github.com/SamuelQuinones/svelte-wordle" target="_blank" class="about-link-btn">
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" style="vertical-align: -0.15em;" viewBox="0 0 16 16">
				<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
			</svg> View Source
		</a>
		<a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" rel="noopener noreferrer" class="about-link">
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
