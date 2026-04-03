<script lang="ts">
	import { statStore } from '$lib/game/statStore';
	import { gameStore } from '$lib/game/stateStore';

	$: maxValue = Math.max(...$statStore.winDistribution);
	$: shouldHighlight = (i: number) => {
		return $gameStore.playState === 'won' && $gameStore.guesses.length === i + 1;
	};
</script>

<section class="stats-overview">
	<div class="stat-item">
		<div class="stat-value">{$statStore.totalGames}</div>
		<div class="stat-label">Played</div>
	</div>
	<div class="stat-item">
		<div class="stat-value">{$statStore.successRate}%</div>
		<div class="stat-label">Win Rate</div>
	</div>
	<div class="stat-item">
		<div class="stat-value">{$statStore.currentStreak}</div>
		<div class="stat-label">Current</div>
	</div>
	<div class="stat-item">
		<div class="stat-value">{$statStore.bestStreak}</div>
		<div class="stat-label">Best</div>
	</div>
</section>

{#if $statStore.totalGames > 0}
	<h3 class="dist-title">Guess Distribution</h3>
	<section class="distribution">
		{#each $statStore.winDistribution as win, i}
			<div class="dist-row">
				<span class="dist-num">{i + 1}</span>
				<div class="dist-bar-container">
					<div
						class="dist-bar"
						class:dist-highlight={shouldHighlight(i)}
						style="width: {isNaN(win / maxValue) ? 8 : (win / maxValue) * 90 + 8}%"
					>
						<span class="dist-count">{win}</span>
					</div>
				</div>
			</div>
		{/each}
	</section>
{/if}

<style>
	.stats-overview {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		padding: 0.75rem 0;
	}
	.stat-item {
		text-align: center;
	}
	.stat-value {
		font-size: 1.75rem;
		font-weight: 800;
		line-height: 1.2;
		color: var(--text-primary);
	}
	.stat-label {
		font-size: 0.65rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		margin-top: 2px;
	}

	.dist-title {
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
		margin: 0.75rem 0 0.5rem;
	}

	.distribution {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.dist-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.dist-num {
		font-size: 0.8rem;
		font-weight: 700;
		width: 1rem;
		text-align: right;
		color: var(--text-secondary);
		flex-shrink: 0;
	}
	.dist-bar-container {
		flex: 1;
		min-width: 0;
	}
	.dist-bar {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		min-height: 22px;
		padding: 2px 6px;
		border-radius: 4px;
		background: var(--bg-elevated);
		transition: width 0.4s ease;
	}
	.dist-highlight {
		background: var(--color-accent);
	}
	.dist-count {
		font-size: 0.75rem;
		font-weight: 700;
		color: white;
	}
</style>
