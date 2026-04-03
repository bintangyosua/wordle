<script lang="ts">
	import { decrypt, encrypt } from '$lib/encrypt';
	import { saveGameStats } from '$lib/localStorage';
	import type { IGameStats } from '$lib/types';
	import { statStore } from '$lib/game/statStore';
	import { svordleShareData, svordleWriteClipboardText } from '$lib/share';
	import { toastStore } from '$components/Toast';
	import { tick } from 'svelte';

	let importExportView = 'export';
	let importTextarea = '';
	let copied = false;

	$: exportableStats = encrypt(JSON.stringify($statStore));
	$: importableStats = decrypt(importTextarea);
	$: saveDisabled = importTextarea.length === 0 || !importableStats;

	function loadImported() {
		if (!importableStats) return;
		const parsed = JSON.parse(importableStats) as Record<string, unknown>;
		const hasKeys = [
			'winDistribution',
			'gamesFailed',
			'currentStreak',
			'bestStreak',
			'totalGames',
			'successRate'
		].every((k) => k in parsed);
		if (!hasKeys) return;
		const confirmation = confirm(
			'Are you sure you want to override the statistics on this device? This action is not reversable.'
		);
		if (confirmation) {
			saveGameStats(parsed as unknown as IGameStats);
			alert('Site will now reload');
			window.location.reload();
		}
	}

	async function onCopied() {
		const dataToShare = {
			title: 'Svordle Stats',
			text: exportableStats
		};

		const didShare = await svordleShareData(dataToShare);
		if (didShare) return;

		const didCopy = await svordleWriteClipboardText(dataToShare.text);
		if (didCopy) {
			copied = true;
			await tick();
			setTimeout(() => (copied = false), 2000);
			return;
		}

		toastStore.show({
			dismissible: false,
			message: 'Share Operation Incomplete',
			type: 'error',
			timeout: 2000
		});
	}

	$: textareaStatus =
		exportableStats === importTextarea
			? 'same'
			: importableStats === null
				? 'invalid'
				: 'default';
</script>

<div class="transfer-tabs">
	{#each ['import', 'export'] as operation}
		<label class="tab-item" class:active={importExportView === operation}>
			<input
				type="radio"
				name="operations"
				value={operation}
				bind:group={importExportView}
			/>
			{operation}
		</label>
	{/each}
</div>

<div class="transfer-body">
	{#if importExportView === 'import'}
		<textarea
			rows={6}
			class="transfer-textarea"
			class:textarea-warn={textareaStatus === 'same'}
			class:textarea-error={textareaStatus === 'invalid'}
			placeholder="Paste your exported stats here..."
			bind:value={importTextarea}
		></textarea>
		<div class="transfer-actions">
			<button
				on:click={loadImported}
				disabled={saveDisabled}
				class="btn btn-primary"
			>
				Import Stats
			</button>
		</div>
	{:else}
		<textarea
			readonly
			rows={6}
			class="transfer-textarea"
			bind:value={exportableStats}
		></textarea>
		<div class="transfer-actions">
			<button on:click={onCopied} class="btn btn-primary">
				{#if copied}
					Copied! ✓
				{:else}
					Copy to Clipboard
				{/if}
			</button>
		</div>
	{/if}
</div>

<style>
	.transfer-tabs {
		display: flex;
		gap: 0.25rem;
		background: var(--bg-tertiary);
		border-radius: 10px;
		padding: 3px;
		margin-bottom: 1rem;
	}
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: capitalize;
		border-radius: 8px;
		cursor: pointer;
		color: var(--text-secondary);
		transition: all 0.2s ease;
	}
	.tab-item.active {
		background: var(--color-accent);
		color: white;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
	}
	.tab-item input {
		display: none;
	}

	.transfer-body {
		margin-top: 0.5rem;
	}
	.transfer-textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-primary);
		border-radius: 10px;
		background: var(--bg-tertiary);
		color: var(--text-primary);
		font-family: monospace;
		font-size: 0.75rem;
		resize: none;
		transition: border-color 0.2s ease;
	}
	.transfer-textarea:focus {
		outline: none;
		border-color: var(--color-accent);
	}
	.transfer-textarea.textarea-warn {
		border-color: var(--color-present);
		background: rgba(181, 159, 59, 0.1);
	}
	.transfer-textarea.textarea-error {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}

	.transfer-actions {
		margin-top: 0.75rem;
		text-align: center;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1.5rem;
		border-radius: 10px;
		border: none;
		font-family: var(--font-primary);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.btn-primary {
		background: var(--color-accent);
		color: white;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
	}
	.btn-primary:hover {
		background: var(--color-accent-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
	}
	.btn-primary:active {
		transform: translateY(0);
	}
	.btn-primary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
</style>
