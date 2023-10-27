<script lang="ts">
    import { page } from "$app/stores";
    import type { FailDataType } from "$lib/api";
    import Modal from "./Modal.svelte";
    import { xlsxErrorSheet } from "./errorSheet";
    import { showModal } from "./modal";

    $: form = $page.form as FailDataType;
    $: if (form && form?.type === "XLSX-Validation") {
        showModal("XlsxErrorSheet");
    }

    $: if ($xlsxErrorSheet) {
        form = $xlsxErrorSheet;
    }

    const getKeys = (form: FailDataType) => {
        if (form.type === "XLSX-Validation")
            return form.errors.reduce<Set<string>>((acc, v) => {
                v.errors.forEach((s) => {
                    acc = acc.add(s.key);
                });
                return acc;
            }, new Set([]));
        else return [];
    };
</script>

<Modal on:close={(e) => e.detail()} key="XlsxErrorSheet">
    <div slot="title">
        Errors {#if form?.type === "XLSX-Validation"}{form.fileName}{/if}
    </div>
    <div class="mt-1 grid grid-col-2">
        {#if form?.type === "XLSX-Validation"}
            {@const keys = getKeys(form)}
            <table class="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th />
                        {#each keys as g}
                            <th>{g}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each form.errors as e}
                        <tr>
                            <td>{e.row}</td>
                            {#each e.errors as m}
                                <td>{m.error}</td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</Modal>
