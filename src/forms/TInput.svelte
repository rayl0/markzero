<script lang="ts">
  import { parseKey } from "$lib/utils";
  import { createEventDispatcher, getContext } from "svelte";

  export let name: string;
  export let value: any = "";
  export let type: string = "text";
  export let nolabel: boolean = false;
  export let style: string = "";
  export let width: string = "w-full max-w-md";
  export let hidden: boolean = false;

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
</script>

<div class:hidden class="form-control {width}">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  {#if !nolabel}
    <label class="label"><slot /></label>
  {/if}
  <input
    {name}
    {value}
    {type}
    {...$$restProps}
    on:input={(e) => dispatch("change", e.currentTarget.value)}
    class:input-error={hasError}
    class="input input-bordered {style}"
  />
  {#if hasError}
    <div class="text-error">
      {error}
    </div>
  {/if}
</div>
