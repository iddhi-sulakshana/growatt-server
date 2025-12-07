import { create } from "zustand";
import { persist } from "zustand/middleware";
import QueryClient from "./QueryClient";
import { toast } from "sonner";

interface AuthState {
    // Login State
    isAuthenticated: boolean;
    token: string | null;

    // Actions
    login: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Initial State
            isAuthenticated: false,
            token: null,

            // Actions
            login: (token: string) => {
                set({ isAuthenticated: true, token });
                QueryClient.invalidateQueries();
                toast.success("Welcome back!");
            },
            logout: () => {
                set({ isAuthenticated: false, token: null });
                QueryClient.invalidateQueries();
                toast.success("See you next time!");
            },
        }),
        {
            name: "auth-storage", // unique name for localStorage key
        }
    )
);
