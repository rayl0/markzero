import { writable } from "svelte/store";


export const theme = writable<"cupcake" | "forest">("cupcake");