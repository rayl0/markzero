<script lang="ts">
    import Modal from "@comps/Modal.svelte";
    import { showModal } from "@comps/modal.js";
    import { pushToast } from "@comps/toast.js";
    import Form from "@forms/Form.svelte";
    import Select from "@forms/Select.svelte";
    import SubmitButton from "@forms/SubmitButton.svelte";
    import TInput from "@forms/TInput.svelte";
    import { Status, Type, type DataPoint } from "@prisma/client";
    import EditIcon from "~icons/lucide/edit-2";
    import DeleteIcon from "~icons/lucide/trash";
    import { dateOlderThanDays } from "$lib/apiUtils";
    import { PUBLIC_CITYSTATE_API_KEY } from "$env/static/public";

    export let data;
    export let form;

    let selectedDataPointId: string;
    let selectedStatus: Status = "Login";

    let selectedDataPointData: DataPoint | undefined = undefined;

    let selectedState = "";
    let selectedStateName: string | null = "";
    let cities: { name: string }[] = [];

    async function fetchCities(selectedState) {
        let headers = new Headers();
        headers.append("X-CSCAPI-KEY", PUBLIC_CITYSTATE_API_KEY);

        let requestOptions = {
            method: "GET",
            headers: headers,
            redirect: "follow",
        };

        // Pass Country Code -- Eg: Country Code : IN
        cities = (await (
            await fetch(
                `https://api.countrystatecity.in/v1/countries/IN/states/${selectedState}/cities`,
                requestOptions as RequestInit,
            )
        ).json()) as { name: string; iso2: string }[];
    }

    $: if (selectedState != "")
        selectedStateName = data.states!.find(
            (v) => v.iso2 === selectedState,
        )!.name;
    $: if (selectedState != "") fetchCities(selectedState);

    $: if (selectedDataPointId != "" && data.dataPoints) {
        selectedDataPointData = data.dataPoints.find((v) => {
            return v.id === selectedDataPointId;
        });
    }

    let stats = {
        login: 0,
        disbursed: 0,
        rejected: 0,
        approved: 0,
    };

    function isDateYesterday(inputDate: Date) {
        // Create Date objects for the given date and the current date
        const givenDate = new Date(inputDate);
        const currentDate = new Date();

        // Calculate the date for yesterday
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);

        // Compare the year, month, and day components
        return (
            givenDate.getFullYear() === yesterday.getFullYear() &&
            givenDate.getMonth() === yesterday.getMonth() &&
            givenDate.getDate() === yesterday.getDate()
        );
    }

    $: if (data.dataPoints) {
        stats = data.dataPoints.reduce<typeof stats>(
            (acc, v) => {
                const incrementLogin = () => {
                    if (
                        !isDateYesterday(v.createdAt) &&
                        !dateOlderThanDays(v.createdAt, 1)
                    )
                        acc.login++;
                };

                switch (v.status) {
                    case "Login":
                        incrementLogin();
                        break;
                    case "Disbursed":
                        if (
                            !isDateYesterday(v.statusUpdate) &&
                            !dateOlderThanDays(v.statusUpdate, 1)
                        )
                            acc.disbursed++;

                        incrementLogin();
                        break;
                    case "Rejected":
                        if (
                            !isDateYesterday(v.statusUpdate) &&
                            !dateOlderThanDays(v.statusUpdate, 1)
                        )
                            acc.rejected++;

                        incrementLogin();
                        break;
                    case "Approved":
                        if (
                            !isDateYesterday(v.statusUpdate) &&
                            !dateOlderThanDays(v.statusUpdate, 1)
                        )
                            acc.approved++;

                        incrementLogin();
                        break;
                }

                return acc;
            },
            {
                login: 0,
                disbursed: 0,
                rejected: 0,
                approved: 0,
            },
        );
    }
</script>

<Modal let:close on:close={(e) => e.detail()} key="addDataPoint">
    <div slot="title">Add Lead</div>
    <Form
        on:success={() => {
            pushToast("Added Lead Successfully!");
            close();
            selectedStateName = null
        }}
        action="?/addDataPoint"
        let:updating
        {form}
    >
        <div class="grid grid-cols-2 gap-2">
            <TInput width="w-full col-span-1" name="executiveName"
                >Executive Name</TInput
            >
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
                    {#if data.assignedProductTypes}
                        {#each data.assignedProductTypes as b}
                            <option>{b}</option>
                        {/each}
                    {/if}
                </svelte:fragment>
            </Select>
            <TInput
                width="w-full col-span-1"
                name="+amount?"
                placeholder="@optional">Amount</TInput
            >
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
                placeholder="@optional">Remarks</TInput
            >
            <TInput
                width="w-full col-span-2"
                name="state"
                value={selectedStateName}
                nolabel
                hidden
            ></TInput>
            <Select
                value={selectedState}
                on:change={(e) => (selectedState = e.detail)}
                width="w-full col-span-1"
                name="statetemp"
                >State
                <svelte:fragment slot="opts">
                    <option selected disabled>Select a state</option>
                    {#each data.states as b}
                        <option value={b.iso2}>{b.name}</option>
                    {/each}
                </svelte:fragment>
            </Select>
            <Select width="w-full col-span-1" name="location"
                >Location
                <svelte:fragment slot="opts">
                    <option>Select a location</option>
                    {#each cities as b}
                        <option>{b.name}</option>
                    {/each}
                </svelte:fragment>
            </Select>
            <SubmitButton
                class="btn btn-primary col-span-2 w-full"
                {updating}
            />
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
        {form}
    >
        <div class="grid grid-cols-2 gap-2">
            <TInput name="id" value={selectedDataPointId} hidden />
            <Select
                value={selectedStatus}
                on:change={(e) => (selectedStatus = e.detail)}
                width="w-full col-span-2"
                name="status"
                >Status
                <svelte:fragment slot="opts">
                    <option selected disabled>Select a status</option>
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
                placeholder="@optional">Remarks</TInput
            >
            <SubmitButton
                class="btn btn-primary col-span-2 w-full"
                {updating}
            />
        </div>
    </Form>
</Modal>

<Modal let:close on:close={(e) => e.detail()} key="deleteDataPoint">
    <div slot="title">Delete Lead</div>
    {#if selectedDataPointData}
        <div class="card bg-base-200 my-2">
            <div class="card-body">
                <div class="card-title">{selectedDataPointData.name}</div>
                <div class="grid grid-cols-3">
                    <div class="flex flex-col justify-between">
                        <div class="text-sm">Stage</div>
                        <div class="badge gap-x-1">
                            <span
                                class="badge badge-xs"
                                class:badge-primary={selectedDataPointData.status ===
                                    "Approved"}
                                class:badge-success={selectedDataPointData.status ===
                                    "Disbursed"}
                                class:badge-warning={selectedDataPointData.status ===
                                    "Login"}
                                class:badge-error={selectedDataPointData.status ===
                                    "Rejected"}
                            />

                            {selectedDataPointData.status}
                        </div>
                    </div>
                    <div class="">
                        <span class="text-sm">Amount</span>
                        <div>
                            {#if selectedDataPointData.amount}
                                {selectedDataPointData.amount}
                            {:else}
                                ..
                            {/if}
                        </div>
                    </div>
                    <div>
                        <span class="text-sm">Executive Name</span>
                        <div>{selectedDataPointData.executiveName}</div>
                    </div>
                </div>
            </div>
        </div>
        <Form
            on:success={() => {
                selectedDataPointId = "";
                pushToast("Deleted Successfully!");
                close();
            }}
            action="?/deleteDataPoint"
            let:updating
            {form}
        >
            <div class="grid grid-cols-2 gap-2">
                <TInput name="id" value={selectedDataPointId} hidden />
                <SubmitButton
                    class="btn btn-primary col-span-2 w-full"
                    {updating}>Delete</SubmitButton
                >
            </div>
        </Form>
    {/if}
</Modal>

<button class="btn mt-1 btn-primary" on:click={() => showModal("addDataPoint")}
    >Add Lead</button
>
<div class="divider m-1" />
<div class="stats bg-base-200 my-2 mb-4 text-base-content">
    <div class="stat">
        <div class="stat-title">Today Login</div>
        <div class="stat-value">{stats.login}</div>
    </div>
    <div class="stat">
        <div class="stat-title">Today Approved</div>
        <div class="stat-value">{stats.approved}</div>
    </div>
    <div class="stat">
        <div class="stat-title">Today Rejected</div>
        <div class="stat-value">{stats.rejected}</div>
    </div>
    <div class="stat">
        <div class="stat-title">Today Disbursed</div>
        <div class="stat-value">{stats.disbursed}</div>
    </div>
</div>
<table class="table table-sm">
    <thead>
        <tr>
            <th>Login Date</th>
            <th>Name</th>
            <th>Bank</th>
            <th>Executive Name</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Remarks</th>
            <th>Mobile</th>
            <!-- <th></th> -->
        </tr>
    </thead>
    <tbody>
        {#if data.dataPoints}
            {#each data.dataPoints as s}
                <tr>
                    <td>{s.createdAt.toLocaleDateString("en-IN")}</td>
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
                                class:badge-error={s.status === "Rejected"}
                            />

                            {s.status}
                        </span></td
                    >
                    <td>
                        {#if s.remarks}
                            {s.remarks}
                        {:else}
                            ..
                        {/if}
                    </td>
                    {#if data.role !== "ADMIN" && data.role !== "SUPERVISOR"}
                        <td>
                            <button
                                on:click={() => (
                                    (selectedDataPointId = s.id),
                                    showModal("editStatus")
                                )}
                                class="btn btn-sm btn-ghost"
                                ><EditIcon /></button
                            >
                            {#if !dateOlderThanDays(s.createdAt, 0.085)}
                                <button
                                    on:click={() => (
                                        (selectedDataPointId = s.id),
                                        showModal("deleteDataPoint")
                                    )}
                                    class="btn btn-sm btn-ghost"
                                    ><DeleteIcon /></button
                                >
                            {/if}
                        </td>
                    {/if}
                    {#if data.role == "ADMIN"}
                    <td>
                        <span>{s.mobile}</span>
                    </td>
                    {/if}
                </tr>
            {/each}
        {/if}
    </tbody>
</table>
