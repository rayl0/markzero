import { zodToValidationErrors, type FailDataType, isPrismaError, handlePrismaError } from "$lib/api.js";
import { auth } from "$lib/server/lucia"
import { error, fail, redirect } from "@sveltejs/kit";
import { LuciaError } from "lucia";
import { z } from "zod";

const loginSchema = z.object({
    username: z.string().trim().nonempty(),
    password: z.string().trim().nonempty()
})

export const actions = {
    async default({ locals }) {
        const res = loginSchema.safeParse(locals.formData);
        if (!res.success) {
            return fail(400, {
                type: "Validation",
                errors: zodToValidationErrors(res)
            } as FailDataType)
        }

        try {
            const key = await auth.useKey('email', res.data.username, res.data.password);

            await auth.invalidateAllUserSessions(key.userId);
            await auth.deleteDeadUserSessions(key.userId);

            const session = await auth.createSession({
                userId: key.userId,
                attributes: {}
            });

            locals.auth.setSession(session);
        } catch (e: any) {
            if (isPrismaError(e)) {
                return fail(400, await handlePrismaError(e).json());
            }

            if (e instanceof LuciaError) {
                switch (e.message) {
                    case "AUTH_INVALID_KEY_ID":
                        return fail(400, {
                            type: "Logic",
                            error: "User doesn't exist"
                        } as FailDataType);
                    case "AUTH_INVALID_PASSWORD":
                        return fail(400, {
                            type: "Logic",
                            error: "Incorrect password"
                        } as FailDataType);
                }
            }

            throw error(500, {
                message: "Unexpected authentication error occurred: \n" + e
            });
        }

        throw redirect(303, '/');
    }
}