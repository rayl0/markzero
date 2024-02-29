import db from "$lib/server/database";

export async function load() {
    const users = await db.user.findMany();
    const data = await db.dataPoint.findMany({
        where: {
            OR: [
                {
                    status: {
                        in: ["Rejected", "Disbursed"],
                    },
                    statusUpdate: {
                        gte: new Date(new Date().getTime() - 86400000)
                    }
                },
                {
                    status: {
                        in: ["Login", "Approved"]
                    }
                }
            ]
        },
        include: {
            user: {
                select: {
                    username: true
                }
            }
        }
    });

    return {
        users,
        data
    }
}