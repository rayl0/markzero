import { lucia } from "lucia";
import { sveltekit } from "lucia/middleware";
import { dev } from "$app/environment";
import { prisma } from "@lucia-auth/adapter-prisma";
import db from "./database";

export const auth = lucia({
	env: dev ? "DEV" : "PROD",
	middleware: sveltekit(),
	adapter: prisma(db),
	sessionExpiresIn: {
		activePeriod: 25 * 60 * 1000,
		idlePeriod: 5 * 60 * 60 * 1000,
	},

	getUserAttributes(e) {
		return {
			username: e.username,
			role: e.role,
			assignedBanks: e.assignedBanks,
			assignedProductTypes: e.assignedProductTypes
		}
	},
});