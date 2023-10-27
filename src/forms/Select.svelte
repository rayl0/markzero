<script lang="ts">
  import { parseKey } from "$lib/utils";
  import { createEventDispatcher, getContext } from "svelte";
  import { onMount } from "svelte";

  export let name: string;
  export let value: any = "";
  export let nolabel: boolean = false;
  export let width: string = "w-full max-w-md";
  export let style: any = "";

  const dispatch = createEventDispatcher<{ change: any }>();

  let error = "";
  let hasError = false;

  let form = getContext<any>("form");

  $: validationName = parseKey(name).name;
  $: if ($form && $form.type === "Validation") {
    hasError = !!$form.errors[validationName];
    error = $form.errors[validationName];
  } else {
    hasError = false;
  }

  let selectRef: HTMLSelectElement;
  const getRef = () => selectRef;
  const setIndex = () => (selectRef.selectedIndex = 0);
  const setValue = () => selectRef && (selectRef.value = value);

  $: if (value) setValue();
  $: if (getRef() && !value) {
    setIndex();
  }

  onMount(() => {
    if (value != "") {
      setValue();
    } else {
      selectRef.selectedIndex = 0;
    }
  });
</script>

<div class="form-control {width}">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  {#if !nolabel}
    <label class="label"><slot /></label>
  {/if}
  <select
    bind:this={selectRef}
    {name}
    {...$$restProps}
    on:change={(e) => dispatch("change", e.currentTarget.value)}
    class:select-error={hasError}
    class="select select-bordered {style}"
  >
    <slot name="opts" />
  </select>
  {#if hasError}
    <div class="text-error">
      {error}
    </div>
  {/if}
</div>
