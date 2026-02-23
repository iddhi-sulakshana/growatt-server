import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemeStore } from "@/lib/ThemeStore";

/**
 * Syncs Zustand theme store (persisted to localStorage) with next-themes.
 * Applies stored theme on load/rehydration and whenever the store changes.
 */
const ThemeSync = () => {
    const { setTheme } = useTheme();

    useEffect(() => {
        setTheme(useThemeStore.getState().theme);
        const unsub = useThemeStore.subscribe(() => {
            setTheme(useThemeStore.getState().theme);
        });
        return unsub;
    }, [setTheme]);

    return null;
};

export default ThemeSync;
