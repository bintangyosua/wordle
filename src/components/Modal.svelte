<script lang="ts">
	export let id: string | undefined = undefined;
	let dialogElement: HTMLDialogElement;

	export let onOpen: () => void = () => void 0;
	export let onClose: () => void = () => void 0;

	export function openModal() {
		dialogElement.showModal();
		onOpen();
	}

	export function closeModal() {
		dialogElement.close();
		onClose();
	}

	export function openWithoutCallback() {
		dialogElement.showModal();
	}

	export function closeModalWithoutCallback() {
		dialogElement.close();
	}

	function handleOutsideClick(e: MouseEvent) {
		const dialogDimensions = dialogElement.getBoundingClientRect();
		if (
			e.clientX < dialogDimensions.left ||
			e.clientX > dialogDimensions.right ||
			e.clientY < dialogDimensions.top ||
			e.clientY > dialogDimensions.bottom
		) {
			closeModal();
		}
	}

	// need this to override closing behavior
	function onKeyDown(e: KeyboardEvent) {
		if (e.key.toLowerCase() === 'escape' && dialogElement.open) {
			e.preventDefault();
			closeModal();
		}
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
<dialog
	{id}
	class="app-modal"
	bind:this={dialogElement}
	on:pointerdown={handleOutsideClick}
	on:keydown={onKeyDown}
>
	<div class="modal-header">
		<div class="grow">
			<slot name="header" />
		</div>
		<button on:click={closeModal} class="modal-close" aria-label="Close modal">
			<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
				<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
			</svg>
		</button>
	</div>

	<div class="modal-body">
		<slot />
	</div>

	{#if $$slots.footer}
		<div class="modal-footer">
			<slot name="footer" />
		</div>
	{/if}
</dialog>

<style>
	.app-modal {
		color: var(--text-primary);
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		max-height: calc(100% - 2rem);
		width: calc(100% - 2rem);
		max-width: 500px;
		overflow: hidden;
		padding: 0;
		position: fixed;
		inset: 0;
		margin: auto;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.05);
		animation: modalIn 0.25s ease-out;
	}

	@keyframes modalIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.app-modal[open] {
		display: flex;
		flex-direction: column;
	}

	.app-modal::backdrop {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.modal-header {
		display: flex;
		align-items: center;
		padding: 1rem 1rem 0.5rem;
		border-bottom: 1px solid var(--border-primary);
		padding-bottom: 0.75rem;
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}
	.modal-close:hover {
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}

	.modal-body {
		padding: 1rem;
		overflow-y: auto;
	}

	.modal-footer {
		padding: 0 1rem 1rem;
	}
</style>
