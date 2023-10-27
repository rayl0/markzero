<script lang="ts">
    export let updating: boolean;
    let Class: string;

    export {Class as class};
</script>

<button class={Class}>
    {#if updating}
        <div class="loading loading-spinner" />
    {:else}
        <slot>Submit</slot>
    {/if}
</button>
