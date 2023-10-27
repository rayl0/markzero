import type { FailDataType } from "$lib/api";
import { writable } from "svelte/store";

export const xlsxErrorSheet = writable<FailDataType | null>(null);