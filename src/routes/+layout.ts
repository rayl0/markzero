import { browser } from "$app/environment";
import { theme } from "./theme";

export function load({ data }) {
    let tempTheme = "cupcake";
    if (browser) {
        const _theme = localStorage.getItem("data-theme");
        if (_theme) {
            tempTheme = _theme
            // @ts-ignore
            theme.set(_theme);
        }
    }

    return {
        theme: tempTheme,
        role: data.role
    }
}