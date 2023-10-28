import { auth } from '$lib/server/lucia.js';
import { redirect } from '@sveltejs/kit';
import { LuciaError } from 'lucia';

export async function GET({ locals }) {
    const session = await locals.auth.validate();
    if (!session) {
        throw redirect(303, '/login')
    };

    if (session) {
        try {
            await auth.invalidateSession(session.sessionId);
            locals.auth.setSession(null);
        } catch (e) {
            if (e instanceof LuciaError && e.message === "AUTH_INVALID_SESSION_ID") {
                throw redirect(303, '/login');
            }
        }

        throw redirect(303, '/login');
    }
}