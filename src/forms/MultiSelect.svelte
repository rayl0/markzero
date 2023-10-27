<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let value: any[] = [];
  export let nolabel: boolean = false;
  export let width: string = "w-full max-w-md";
  export let placeholder: string = "";
  export let native: boolean = false;
  export let name: string = "";

  export let options: { l: string; v: string }[] = [];

  const dispatch = createEventDispatcher<{ change: any[] }>();

  let filteredOptions = options;

  $: {
    filteredOptions = options.filter((s) => !value.includes(s.v));
  }

  let error = "";
  let hasError = false;

  let dropdownOpen = false;
  let focusedSelected = false;
</script>

<style>
  .border-multiselect {
    --tw-border-opacity: 0.2;
    border-color: hsl(var(--bc) / var(--tw-border-opacity));
  }
</style>

<div class="form-control {width}">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  {#if !nolabel}
    <label class="label"><slot /></label>
  {/if}
  {#if native}
    <select hidden {name} {value} multiple>
      {#each options as { l, v }}
        <option value={v}>{l}</option>
      {/each}
    </select>
  {/if}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    tabindex="0"
    on:click={() => (dropdownOpen = !dropdownOpen)}
    on:focusout={(e) => {
      if (
        e.relatedTarget instanceof HTMLElement &&
        e.currentTarget.contains(e.relatedTarget)
      )
        focusedSelected = true;
      else focusedSelected = false;

      if (!focusedSelected) dropdownOpen = false;
    }}
    on:keydown={(e) => {
      switch (e.key) {
        case "Enter":
          dropdownOpen = true;
          break;
      }
    }}
    class="border-multiselect min-h-[1.5rem] relative focus-within:outline-neutral focus-within:outline-offset-2 focus-within:outline focus:outline-2 flex-wrap border flex flex-row items-center px-2 bg-base-100"
    class:py-[7px]={value.length > 0}
    class:py-3={value.length === 0}>
    <div class="flex-grow">
      <ul class="flex flex-row gap-2 items-center flex-wrap">
        {#each value as v}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li
            tabindex="0"
            on:focusin={() => {
              focusedSelected = true;
            }}
            on:keydown={(e) => {
              switch (e.key) {
                case "Backspace":
                  value = value.filter((s) => s !== v);
                  dispatch("change", value);
                  break;
              }
            }}
            class="flex bg-base-200 focus-within:outline-neutral focus-within:outline-offset-2 focus-within:outline focus:outline items-center border border-neutral rounded-md px-2 gap-1">
            <div>
              {v}
            </div>
            <div
              on:click|stopPropagation={() => {
                value = value.filter((s) => s !== v);
                dispatch("change", value);
              }}
              class="btn btn-sm btn-ghost btn-neutral py-0 text-lg px-0">
              &times;
            </div>
          </li>
        {/each}
        <span class:hidden={value.length > 0} class="select-none">
          {placeholder}
        </span>
        <span class:hidden={filteredOptions.length || value.length}
          >No Options</span>
      </ul>
    </div>
    <ul
      class:hidden={!dropdownOpen}
      class="absolute z-[1] max-h-72 overflow-y-auto rounded-box border-neutral border w-full shadow-sm bg-base-100 top-[100%] left-0">
      {#each filteredOptions as o}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li
          on:click|stopPropagation={() => {
            value = [...value, o.v];
            dropdownOpen = false;
            dispatch("change", value);
          }}
          class="hover:bg-base-200 focus:bg-base-200 rounded-box px-4 py-2">
          {o.l}
        </li>
      {/each}
    </ul>
  </div>
  <div class="relative" />

  {#if hasError}
    <div class="text-error">
      {error}
    </div>
  {/if}
</div>

<!-- <div class="form-control {span}">
  <label class="pl-1 leading-10"><slot /></label>
</div> -->
