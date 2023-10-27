<script lang="ts">
    import File from "@forms/File.svelte";
    import Form from "@forms/Form.svelte";
    import TInput from "@forms/TInput.svelte";
    import SubmitButton from "@forms/SubmitButton.svelte";
    import MultiSelect from "@forms/MultiSelect.svelte";
    import Select from "@forms/Select.svelte";
    import { Role, Bank } from "@prisma/client";

    export let form;

    let selectedRole: Role = "NORMAL";
</script>

<h1 class="text-3xl my-4 text-center"> Add user </h1>
<Form {form} let:updating>
    <div class="flex flex-col gap-2 max-w-md mx-auto">
    <TInput name="username">User Name</TInput>
    <TInput type="password" name="password">Password</TInput>
    <Select
        value={selectedRole}
        on:change={(e) => (selectedRole = e.detail)}
        name="role"
        >Role
        <svelte:fragment slot="opts">
            <option selected disabled>Select a option</option>
            {#each Object.keys(Role) as s}
                <option>{s}</option>
            {/each}
        </svelte:fragment>
    </Select>
    {#if selectedRole !== "ADMIN" && selectedRole !== "SUPERVISOR"}
        <MultiSelect
            options={Object.values(Bank).map((s) => ({
                v: s,
                l: s,
            }))}
            name="#assignedBanks"
            native
            placeholder="Select products for the user">
            Products
        </MultiSelect>
    {/if}
    <SubmitButton {updating} class="btn btn-primary max-w-md w-full"
        >Submit</SubmitButton>

    </div>
</Form>
