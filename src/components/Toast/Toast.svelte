<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { spring } from 'svelte/motion';
	import { fly } from 'svelte/transition';
	import type { ToastObject } from './store';

	export let dismissible = true;
	export let type: ToastObject['type'] = 'success';

	const dispatch = createEventDispatcher();
	const scale = spring(1);
</script>

<div
	class="toast toast-{type}"
	class:justify-center={!dismissible}
	role="alert"
	transition:fly|global={{ y: -30, duration: 300 }}
>
	<div class:mr-3={dismissible} class:grow={dismissible} class="toast-message"><slot /></div>
	{#if dismissible}
		<button
			class="toast-dismiss"
			aria-label="Dismiss"
			on:click={() => dispatch('dismiss')}
			on:mousedown={() => scale.set(0.8)}
			on:touchstart={() => scale.set(0.8)}
			on:mouseup={() => scale.set(1)}
			on:touchend={() => scale.set(1)}
			on:mouseenter={() => scale.set(1.2)}
			on:mouseleave={() => scale.set(1)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				fill="currentColor"
				style="transform: scale({$scale});"
				viewBox="0 0 16 16"
			>
				<path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z" />
				<path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z" />
			</svg>
		</button>
	{/if}
</div>

<style>
	.toast {
		display: flex;
		align-items: center;
		min-width: 200px;
		max-width: 400px;
		margin: 0 auto 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		font-family: var(--font-primary);
		font-size: 0.9rem;
		font-weight: 600;
		color: #ffffff;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(255, 255, 255, 0.1) inset;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}
	.toast-message {
		line-height: 1.4;
	}
	.toast-success {
		background: rgba(34, 197, 94, 0.9);
	}
	.toast-error {
		background: rgba(239, 68, 68, 0.9);
	}
	.toast-warn {
		background: rgba(245, 158, 11, 0.9);
	}
	.toast-info {
		background: rgba(99, 102, 241, 0.9);
	}

	.toast-dismiss {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 6px;
		border: none;
		background: rgba(255, 255, 255, 0.15);
		color: white;
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.15s ease;
	}
	.toast-dismiss:hover {
		background: rgba(255, 255, 255, 0.25);
	}
</style>
