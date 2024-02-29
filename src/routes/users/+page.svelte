<script lang="ts">
    export let data;
</script>

<table class="table">
    <thead>
        <tr>
            <th>UserName</th>
            <th>Role</th>
            <th>Product</th>
            <th>SubProduct</th>
        </tr>
    </thead>
    <tbody>
        {#each data.users as u}
            <tr>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>{u.assignedBanks}</td>
                <td>{u.assignedProductTypes}</td>
            </tr>
        {/each}
    </tbody>
</table>
