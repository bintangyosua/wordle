<script lang="ts">
	import { browser } from '$app/environment';
	import { loadGameHistory } from '$lib/localStorage';
	import { gameModeStore } from '$lib/game/gameModeStore';
	import { gameStore } from '$lib/game/stateStore';
	import type { IGameHistoryEntry, WordLengthMode } from '$lib/types';

	type FilterMode = 'all' | WordLengthMode;
	let filter: FilterMode = 'all';

	// Re-read history when filter, mode, or playState changes (so new games show up immediately)
	$: history = loadHistory(filter, $gameModeStore, $gameStore.playState);

	function loadHistory(_filter: FilterMode, _mode: WordLengthMode, _playState: string): IGameHistoryEntry[] {
		if (!browser) return [];
		if (_filter === 'all') return loadGameHistory();
		return loadGameHistory(_filter);
	}

	function formatDate(ts: number): string {
		const d = new Date(ts);
		return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function formatTime(ts: number): string {
		const d = new Date(ts);
		return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
	}

	const filters: { label: string; value: FilterMode }[] = [
		{ label: 'All', value: 'all' },
		{ label: '4', value: 4 },
		{ label: '5', value: 5 },
		{ label: '6', value: 6 }
	];
</script>

<div class="history-container">
	<div class="filter-bar">
		{#each filters as f}
			<button
				class="filter-btn"
				class:filter-active={filter === f.value}
				on:click={() => (filter = f.value)}
			>
				{f.label}
			</button>
		{/each}
	</div>

	{#if history.length === 0}
		<div class="history-empty">
			<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
				<path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
				<path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
				<path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
			</svg>
			<p>No games played yet.</p>
			<p class="history-empty-sub">Complete a game to see your history here.</p>
		</div>
	{:else}
		<div class="history-list">
			{#each history as entry, i}
				<div class="history-item" style="animation-delay: {i * 30}ms">
					<div class="history-word-row">
						<span class="history-word">{entry.word}</span>
						<span class="history-mode-tag">{entry.mode}L</span>
					</div>
					<div class="history-details">
						<span class="history-score" class:history-won={entry.won} class:history-lost={!entry.won}>
							{#if entry.won}
								{entry.guesses}/{entry.maxGuesses}
							{:else}
								✗
							{/if}
						</span>
						<span class="history-date">{formatDate(entry.timestamp)} · {formatTime(entry.timestamp)}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.history-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* ===== Filter bar ===== */
	.filter-bar {
		display: flex;
		gap: 2px;
		background: var(--bg-tertiary);
		border-radius: 8px;
		padding: 2px;
		align-self: center;
	}
	.filter-btn {
		padding: 4px 14px;
		border-radius: 6px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.filter-btn:hover {
		color: var(--text-primary);
	}
	.filter-btn.filter-active {
		background: var(--color-accent);
		color: white;
		box-shadow: 0 1px 4px rgba(99, 102, 241, 0.3);
	}

	/* ===== Empty state ===== */
	.history-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem 1rem;
		color: var(--text-muted);
	}
	.history-empty svg {
		opacity: 0.3;
		margin-bottom: 0.5rem;
	}
	.history-empty p {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-secondary);
	}
	.history-empty-sub {
		font-size: 0.75rem !important;
		font-weight: 400 !important;
		color: var(--text-muted) !important;
	}

	/* ===== List ===== */
	.history-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		max-height: 320px;
		overflow-y: auto;
	}

	.history-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--border-primary);
		animation: slideUp 0.3s ease both;
	}
	.history-item:last-child {
		border-bottom: none;
	}

	.history-word-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.history-word {
		font-size: 0.95rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		color: var(--text-primary);
	}
	.history-mode-tag {
		font-size: 0.6rem;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--bg-tertiary);
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.history-details {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.history-score {
		font-size: 0.85rem;
		font-weight: 800;
		min-width: 2rem;
		text-align: center;
	}
	.history-won {
		color: var(--color-correct);
	}
	.history-lost {
		color: #ef4444;
	}

	.history-date {
		font-size: 0.65rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
