import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeValue = "light" | "dark" | "system";

interface ThemeState {
    theme: ThemeValue;
    setTheme: (theme: ThemeValue) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: "system",
            setTheme: (theme) => set({ theme }),
        }),
        { name: "theme-storage" }
    )
);
