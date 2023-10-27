import { writable } from "svelte/store";

export type ToastState = {
  id: string;
  message: string;
  type: "success" | "warning" | "error";
};

export const toastStack = writable<ToastState[]>([]);

export function pushToast(
  message: string,
  type: "success" | "warning" | "error" = "success",
  duration: number = 3000
) {
  const key = message + Date.now();
  toastStack.update((t) => {
    t.push({
      id: key,
      message,
      type,
    });
    return t;
  });

  setTimeout(() => {
    toastStack.update((t) => t.filter((s) => s.id != key));
  }, duration);
}
