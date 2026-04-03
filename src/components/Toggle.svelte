<script lang="ts">
	export let checked = false;
	export let disabled = false;
</script>

<div class="toggle-row">
	<span class="toggle-label"><slot /></span>
	<label class="toggle-switch" class:disabled>
		<input type="checkbox" bind:checked {disabled} />
		<span class="toggle-track">
			<span class="toggle-thumb"></span>
		</span>
	</label>
</div>

<style>
	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.toggle-label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.toggle-switch {
		position: relative;
		display: inline-flex;
		cursor: pointer;
	}
	.toggle-switch.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.toggle-switch input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-track {
		position: relative;
		width: 48px;
		height: 28px;
		border-radius: 14px;
		background: var(--bg-elevated);
		transition: background 0.25s ease;
	}

	.toggle-switch input:checked + .toggle-track {
		background: var(--color-correct);
	}

	.toggle-thumb {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.toggle-switch input:checked + .toggle-track .toggle-thumb {
		transform: translateX(20px);
	}
</style>
