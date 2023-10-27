// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/svelte" />
/// <reference types="lucia" />

import type { Bank, Role } from "@prisma/client";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      formData: Record<string, any>;
      auth: import("lucia").AuthRequest;
      userRole: Role
      userId: string
      assignedBanks?: Bank[] | null
      nFormData: FormData;
    }
    interface PageData {
      seo: {
        title: string;
      };
    }
    // interface Platform {}
  }
  namespace Lucia {
    type Auth = import("$lib/server/lucia").Auth;
    type DatabaseUserAttributes = {
      username: string;
      role: Role;
      assignedBanks?: Bank[] | null
    };
    type DatabaseSessionAttributes = {
    };
  }
}

export {};
