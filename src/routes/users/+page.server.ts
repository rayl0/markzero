import db from "$lib/server/database";

export async function load() {
    const users = await db.user.findMany();

    return {
        users
    }
}