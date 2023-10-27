import { browser, dev } from "$app/environment";
import { writable } from "svelte/store";

export const keyRegister = writable<Set<string>>(new Set());
export const openModal = writable<string>("");

export function registerKey(key: string) {
  let value: Set<string> = new Set();
  const unsubscribe = keyRegister.subscribe((v) => {
    value = v;
  });

  if (!(value.has(key))) {
    keyRegister.update((t) => {
      t = t.add(key);
      return t;
    });
    unsubscribe();
  } else {
    if (!dev && !browser)
      throw `Key "${key}" is already registered`;
  }

  return () => {
    keyRegister.update((t) => {
      t.delete(key);
      return t;
    });
  };
}

export function showModal(key: string) {
  let value: Set<string> = new Set();

  const unsubscribe = keyRegister.subscribe((v) => {
    value = v;
  });

  if (value.has(key)) {
    openModal.set(key);
    unsubscribe();
  } else {
    unsubscribe();
    throw `Modal Key "${key}" is not registered at all`;
  }
}
