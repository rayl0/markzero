<script lang="ts">
    import Modal from "@comps/Modal.svelte";
    import { showModal } from "@comps/modal.js";
    import { pushToast } from "@comps/toast.js";
    import Form from "@forms/Form.svelte";
    import Select from "@forms/Select.svelte";
    import SubmitButton from "@forms/SubmitButton.svelte";
    import TInput from "@forms/TInput.svelte";
    import { Status, Type } from "@prisma/client";
    import EditIcon from "~icons/lucide/edit-2";

    export let data;
    export let form;

    let selectedDataPointId: string;
    let selectedStatus: Status = "Login";
</script>

<Modal let:close on:close={(e) => e.detail()} key="addDataPoint">
    <div slot="title">Add Lead</div>
    <Form
        on:success={() => {
            pushToast("Added Lead Successfully!");
            close();
        }}
        action="?/addDataPoint"
        let:updating
        {form}>
        <div class="grid grid-cols-2 gap-2">
            <TInput width="w-full col-span-1" name="executiveName"
                >Executive Name</TInput>
            <Select width="w-full col-span-1" name="bank"
                >Bank
                <svelte:fragment slot="opts">
                    <option>Select a bank</option>
                    {#if data.assignedBanks}
                        {#each data.assignedBanks as b}
                            <option>{b}</option>
                        {/each}
                    {/if}
                </svelte:fragment>
            </Select>
            <TInput width="w-full col-span-2" name="name">Name</TInput>
            <TInput width="w-full col-span-1" name="mobile">Mobile</TInput>
            <Select width="w-full col-span-1" name="type"
                >Type
                <svelte:fragment slot="opts">
                    <option>Select a type</option>
                    {#each Object.values(Type) as b}
                        <option>{b}</option>
                    {/each}
                </svelte:fragment>
            </Select>
            <TInput
                width="w-full col-span-1"
                name="+amount?"
                placeholder="@optional">Amount</TInput>
            <Select width="w-full col-span-1" name="status"
                >Status
                <svelte:fragment slot="opts">
                    <option>Select a status</option>
                    {#each Object.values(Status) as b}
                        <option>{b}</option>
                    {/each}
                </svelte:fragment>
            </Select>
            <TInput
                width="w-full col-span-2"
                name="remarks?"
                placeholder="@optional">Remarks</TInput>
            <SubmitButton
                class="btn btn-primary col-span-2 w-full"
                {updating} />
        </div>
    </Form>
</Modal>

<Modal let:close on:close={(e) => e.detail()} key="editStatus">
    <div slot="title">Edit Status</div>
    <Form
        on:success={() => {
            selectedDataPointId = "";
            pushToast("Status Updated Successfully!");
            close();
        }}
        action="?/editStatus"
        let:updating
        {form}>
        <div class="grid grid-cols-2 gap-2">
            <TInput name="id" value={selectedDataPointId} hidden />
            <Select
                value={selectedStatus}
                on:change={(e) => (selectedStatus = e.detail)}
                width="w-full col-span-2"
                name="status"
                >Status
                <svelte:fragment slot="opts">
                    <option>Select a status</option>
                    {#each Object.values(Status) as b}
                        <option>{b}</option>
                    {/each}
                </svelte:fragment>
            </Select>
            {#if selectedStatus === "Approved" || selectedStatus === "Disbursed"}
                <TInput width="w-full col-span-2" name="+amount">Amount</TInput>
            {/if}
            <TInput
                width="w-full col-span-2"
                name="remarks?"
                placeholder="@optional">Remarks</TInput>
            <SubmitButton
                class="btn btn-primary col-span-2 w-full"
                {updating} />
        </div>
    </Form>
</Modal>

<button class="btn mt-1 btn-primary" on:click={() => showModal("addDataPoint")}
    >Add Lead</button>
<div class="divider m-1" />
<table class="table">
    <thead>
        <tr>
            <th>Name</th>
            <th>Bank</th>
            <th>Executive Name</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Remarks</th>
            <!-- <th></th> -->
        </tr>
    </thead>
    <tbody>
        {#if data.dataPoints}
            {#each data.dataPoints as s}
                <tr>
                    <td>{s.name}</td>
                    <td>{s.bank}</td>
                    <td>{s.executiveName}</td>
                    <td>
                        {#if s.amount}
                            {s.amount}
                        {:else}
                            ..
                        {/if}
                    </td>
                    <td>
                        <span class="badge gap-x-1">
                            <span
                                class="badge badge-xs"
                                class:badge-primary={s.status === "Approved"}
                                class:badge-success={s.status === "Disbursed"}
                                class:badge-warning={s.status === "Login"}
                                class:badge-error={s.status === "Rejected"} />

                            {s.status}
                        </span></td>
                    <td>
                        {#if s.remarks}
                            {s.remarks}
                        {:else}
                            ..
                        {/if}
                    </td>
                    <td>
                        <button
                            on:click={() => (
                                (selectedDataPointId = s.id),
                                showModal("editStatus")
                            )}
                            class="btn btn-sm btn-ghost"><EditIcon /></button>
                    </td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>
