import { handlePrismaError, isPrismaError, type FailDataType, zodToValidationErrors } from "$lib/api";
import { error, fail } from "@sveltejs/kit";
import { handle } from "../../hooks.server";
import db from "$lib/server/database";
import { z } from "zod";
import type { Bank } from "@prisma/client";


export async function load({ locals }) {
    try {
        const data = locals.userRole !== "ADMIN" ? await db.dataPoint.findMany({
            where:
            {
                userId: locals.userId,
                OR: [
                    // {
                    //     createdAt: {
                    //         gte: new Date(new Date().getTime() - 86400000)
                    //     }
                    // },
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

        }) : await db.dataPoint.findMany({
            where: {
                OR: [
                    // {
                    //     createdAt: {
                    //         gte: new Date(new Date().getTime() - 86400000)
                    //     }
                    // },
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
            }
        });

        return {
            dataPoints: data,
            assignedBanks: locals.assignedBanks
        }
    } catch (e: any) {
        if (isPrismaError(e)) {
            throw error(400, {
                message: await handlePrismaError(e).json()
            })
        }
    }
}

// TODO(rajat): Update Schema
const leadSchema = z.object({
    name: z.string().trim().nonempty(),
    bank: z.string().trim().nonempty(),
    executiveName: z.string().trim().nonempty(),
    amount: z.number().nonnegative().optional(),
    mobile: z.string().regex(/^\d{10}$/),
    status: z.enum(["Approved", "Disbursed", "Rejected", "Login"]),
    type: z.enum([
        "PL",
        "BL",
        "LAP",
        "HL",
        "Doctor"
    ]),
    remarks: z.string().trim().nonempty().optional()
});

const leadEditStatusSchema = z.object({
    id: z.string().trim().nonempty(),
    amount: z.number().nonnegative().optional(),
    status: z.enum(["Approved", "Disbursed", "Rejected", "Login"]),
    remarks: z.string().trim().nonempty().optional()
});

const leadDeleteSchema = z.object({
    id: z.string().trim().nonempty(),
});

export const actions = {
    async deleteDataPoint({ locals }) {
        const res = leadDeleteSchema.safeParse(locals.formData);
        if (!res.success) {
            return fail(400, {
                type: "Logic",
                error: "Invalid Id provided doesn't exist"
            } as FailDataType);
        }

        try {
            await db.dataPoint.delete({
                where: {
                    id: res.data.id
                }
            });
        } catch (e: any) {
            if (isPrismaError(e)) {
                return fail(400, await handlePrismaError(e).json())
            }
        }
    },
    async editStatus({ locals }) {
        const res = leadEditStatusSchema.safeParse(locals.formData);
        if (!res.success) {
            return fail(400, {
                type: "Validation",
                errors: zodToValidationErrors(res)
            } as FailDataType);
        }
        try {
            const data = await db.dataPoint.update({
                where: {
                    id: res.data.id,
                },
                data: {
                    status: res.data.status,
                    remarks: res.data.remarks,
                    amount: res.data.amount,
                    statusUpdate: new Date()
                }
            });

            return { success: true }
        } catch (e: any) {
            if (isPrismaError(e)) {
                return fail(400, await handlePrismaError(e).json())
            }
        }
    },
    async addDataPoint({ locals }) {
        const res = leadSchema.safeParse(locals.formData);
        if (!res.success) {
            return fail(400, {
                type: "Validation",
                errors: zodToValidationErrors(res)
            } as FailDataType);
        }
        try {
            let isAllowed = false;
            if (locals.assignedBanks && locals.assignedBanks.includes(res.data.bank as Bank)) {
                isAllowed = true;
            }

            if (!isAllowed) {
                return fail(400, {
                    type: "Logic",
                    error: "Not allowed to add a lead in this bank"
                } as FailDataType)
            }

            const data = await db.dataPoint.create({
                data: {
                    name: res.data.name,
                    bank: res.data.bank as Bank,
                    status: res.data.status,
                    remarks: res.data.remarks,
                    executiveName: res.data.executiveName,
                    amount: res.data.amount,
                    type: res.data.type,
                    mobile: res.data.mobile,
                    statusUpdate: new Date(),

                    user: {
                        connect: {
                            id: locals.userId
                        }
                    }
                }
            });

            return { success: true }
        } catch (e: any) {
            if (isPrismaError(e)) {
                return fail(400, await handlePrismaError(e, (e) => {
                    if (e.code === "P2002") {
                        return {
                            type: "Logic",
                            error: "Lead already exists in the system"
                        }
                    } else
                        return e.message;
                }).json())
            }
        }
    }
}