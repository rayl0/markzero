// import { auth } from "$lib/server/lucia";
import { auth } from "$lib/server/lucia";
import { formDataToJson } from "$lib/utils";
import { redirect } from "@sveltejs/kit";


export async function handle({ event, resolve }) {
  event.locals.auth = auth.handleRequest(event);

  const session = await event.locals.auth.validate();
  if (!session && event.url.pathname !== "/login" && event.url.pathname !== "/sign-up") {
    throw redirect(302, `/login?redirect=${event.url.pathname}`);
  }

  if (session && session.user) {
    event.locals.userRole = session.user.role;
    event.locals.userId = session.user.userId;
    if (event.locals.userRole === "NORMAL") {
      event.locals.assignedBanks = session.user.assignedBanks;
      event.locals.assignedProductTypes = session.user.assignedProductTypes;
    }
  }

  if (
    event.request.method === "POST" &&
    event.request.headers.get("x-sveltekit-action") === "true"
  ) {
    event.locals.nFormData = await event.request.formData();
    event.locals.formData = formDataToJson(event.locals.nFormData);
    return resolve(event);
  }

  return resolve(event);
}
