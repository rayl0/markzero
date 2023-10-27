<script lang="ts">
  import { parseKey } from "$lib/utils";
  import { getContext } from "svelte";

  export let name: string;
  export let value: any = "";
  export let nolabel: boolean = false;
  export let style: string = "";
  export let hidden: boolean = false;
  export let width: string = "w-full max-w-md";

  let error = "";
  let hasError = false;

  let form = getContext<any>("form");

  $: validationName = parseKey(name).name;
  $: if ($form && $form.type === "Validation") {
    hasError = !!$form.errors[validationName];
    error = $form.errors[validationName];
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
    {...$$props}
    type="file"
    class:file-input-error={error}
    class="file-input file-input-bordered {style}"
  />
  {#if hasError}
    <div class="text-error">
      {error}
    </div>
  {/if}
</div>
