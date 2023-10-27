<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import X from "~icons/lucide/x";
  import { openModal, registerKey } from "./modal";

  // NOTE(rajat): This is not reactive it needs to set only once and should remain the same.
  export let key: string;
  export let noTitle: boolean = false;

  const dispatch = createEventDispatcher<{ close: () => void }>();
  let dialogRef: HTMLDialogElement;

  const close = () => {
    openModal.set("");
    dialogRef.close();
  };

  $: if (key === $openModal && dialogRef) {
    dialogRef.showModal();
  }

  $: unregister = registerKey(key);

  onDestroy(() => {
    unregister();
  });
</script>

<dialog bind:this={dialogRef} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    {#if !noTitle}
      <h1 class="flex justify-between items-center text-lg">
        <slot name="title">No Title</slot>
        <button
          on:click={() => dispatch("close", close)}
          type="button"
          class="btn btn-sm btn-circle btn-ghost"><X /></button
        >
      </h1>
    {/if}
    <slot {close}>No Content Provided</slot>
  </div>
  <button on:click={() => dispatch("close", close)} class="modal-backdrop" />
</dialog>
