import { signinApi } from "@/api/login";
import { useAuthStore } from "@/lib/AuthStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const loginService = () => {
    return useMutation({
        mutationFn: signinApi,
        onError: () => {
            toast.error("Login failed");
        },
        onSuccess: (data) => {
            useAuthStore.getState().login(data.data.token);
        },
    });
};
