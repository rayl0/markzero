import { zodToValidationErrors, type FailDataType, isPrismaError, handlePrismaError } from "$lib/api.js";
import { z } from "zod";
import { auth } from "$lib/server/lucia"
import type { Bank } from "@prisma/client";
import { error, fail, redirect } from "@sveltejs/kit";

export async function load({ locals }) {
    // if(locals.userRole !== "ADMIN") {
    //     throw error(400, {
    //         message: "Only Admin user can access this page"
    //     })
    // }

    return {};
}

const userSchema = z.object({
    username: z.string().trim().nonempty().toLowerCase(),
    password: z.string().trim().nonempty().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    role: z.enum(["ADMIN", "SUPERVISOR", "NORMAL"]),
    assignedBanks: z.array(z.string().trim().nonempty()).optional()
}).refine((k) => {
    if (k.role === "NORMAL" && (!k.assignedBanks || k.assignedBanks?.length === 0)) return false
    return true;
}, { message: "No products provided for the NORMAL user" });

export const actions = {
    async default({ locals, fetch }) {
        console.log(locals.formData);
        const res = userSchema.safeParse(locals.formData);

        if (!res.success) {
            return fail(400, {
                type: 'Validation',
                errors: zodToValidationErrors(res)
            } as FailDataType)
        }

        try {
            const user = await auth.createUser({
                key: {
                    providerId: "username",
                    providerUserId: res.data.username,
                    password: res.data.password
                },
                attributes: {
                    username: res.data.username,
                    role: res.data.role,
                    assignedBanks: res.data.assignedBanks ? res.data.assignedBanks as Bank[] | undefined : null
                }
            });

            const session = await auth.createSession({
                userId: user.userId,
                attributes: {
                }
            });

            locals.auth.setSession(session);

            throw redirect(303, '/');
        } catch (e: any) {
            if (isPrismaError(e)) {
                return fail(400, await handlePrismaError(e).json());
            }

            console.log(e);
        }
    }
}