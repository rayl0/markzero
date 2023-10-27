<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { createEventDispatcher, setContext } from "svelte";
  import { writable } from "svelte/store";

  export let form: any;
  export let action: string = "";
  export let id: string = "";
  export let crossaction = false;

  const dispatch = createEventDispatcher<{
    success: void;
  }>();

  let updating = false;

  const submit: SubmitFunction = () => {
    updating = true;

    return async ({ update, result }) => {
      !crossaction ? await update() : await applyAction(result);
      result.type === "success" && crossaction && (await invalidateAll());

      updating = false;

      switch (result.type) {
        case "redirect":
        case "success":
          dispatch("success");
          break;
      }
    };
  };

  const formdata = writable(form);
  $: formdata.set(form);

  setContext<any>("form", formdata);
</script>

<form {id} {action} method="post" use:enhance={submit}>
  <slot {updating} />
</form>
