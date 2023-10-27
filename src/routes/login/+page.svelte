<script lang="ts">
    import Form from "@forms/Form.svelte";
    import TInput from "@forms/TInput.svelte";
    import SubmitButton from "@forms/SubmitButton.svelte";

    export let form: any;
</script>

<div class="my-4 text-2xl text-center">Login</div>
<Form let:updating {form}>
    <div class="flex flex-col max-w-md gap-2 mx-auto">
        <TInput name="username">User Name</TInput>
        <TInput type="password" name="password">Password</TInput>
        <SubmitButton class="btn btn-primary w-full max-w-md" {updating}>Submit</SubmitButton>
    </div>
</Form>