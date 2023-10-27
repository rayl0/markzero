<script lang="ts">
  import { appLoadingState, type Segment } from "$lib/stores";

  export let segment: Segment;
</script>

{#if $appLoadingState.loading && $appLoadingState.segment === segment}
  <div class="flex flex-col h-72 justify-center items-center">
    <div class="loading loading-lg loading-spinner" />
  </div>
{:else}
  <slot />
{/if}
