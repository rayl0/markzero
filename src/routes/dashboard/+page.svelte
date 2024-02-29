<script lang="ts">
    import { dateOlderThanDays } from "$lib/apiUtils.js";

    export let data;

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

    $: performances = data.data.reduce<
        {
            username: string;
            login: number;
            disbursed: number;
            rejected: number;
            approved: number;
        }[]
    >((acc, v) => {
        let index = acc.findIndex((a) => a.username === v.user.username);

        if (index === -1) {
            acc.push({
                username: v.user.username,
                login: 0,
                disbursed: 0,
                rejected: 0,
                approved: 0,
            });

            index = acc.findIndex((a) => a.username === v.user.username);
        }

        const incrementLogin = () => {
            if (
                !isDateYesterday(v.createdAt) &&
                !dateOlderThanDays(v.createdAt, 1)
            )
                acc[index].login++;
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
                    acc[index].disbursed++;

                incrementLogin();
                break;
            case "Rejected":
                if (
                    !isDateYesterday(v.statusUpdate) &&
                    !dateOlderThanDays(v.statusUpdate, 1)
                )
                    acc[index].rejected++;

                incrementLogin();
                break;
            case "Approved":
                if (
                    !isDateYesterday(v.statusUpdate) &&
                    !dateOlderThanDays(v.statusUpdate, 1)
                )
                    acc[index].approved++;

                incrementLogin();
                break;
        }

        return acc;
    }, []);
</script>

{#if data.role === "ADMIN"}
    <table class="table">
        <thead>
            <tr>
                <th>Username</th>
                <th>Login</th>
                <th>Approved</th>
                <th>Rejected</th>
                <th>Disbursed</th>
            </tr>
        </thead>
        <tbody>
            {#each performances as P}
                <tr>
                    <td>{P.username}</td>
                    <td>{P.login}</td>
                    <td>{P.approved}</td>
                    <td>{P.rejected}</td>
                    <td>{P.disbursed}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    <h1 class="text-3xl font-bold mt-5 text-center">Coming Soon...</h1>
{/if}
