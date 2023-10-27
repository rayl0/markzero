<script lang="ts">
  import { toastStack } from "./toast";
  import CheckCircle from "~icons/lucide/check-circle";
  import AlertTriagnle from "~icons/lucide/alert-triangle";
</script>

<div class="toast toast-top toast-center z-[80]">
  {#each $toastStack as { message, type }}
    <div
      class:alert-warning={type === "warning"}
      class:alert-success={type === "success"}
      class:alert-error={type === "error"}
      class="alert font-semibold"
    >
      {#if type === "warning"}
        <AlertTriagnle />
      {:else}
        <CheckCircle />
      {/if}
      <span>
        {message}
      </span>
    </div>
  {/each}
</div>
