import axios from "axios";
import { useAuthStore } from "./AuthStore";

const ApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Add interceptor to the axios instance
ApiClient.interceptors.request.use((config) => {
    // Get the token from the store and set it in the headers
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    // config.headers["ngrok-skip-browser-warning"] = "true";
    return config;
});

// Add response interceptor to handle 401 errors (unauthorized)
ApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // also check if the url is not /auth/login
        if (
            error.response?.status === 401 &&
            error.response?.config?.url !== "/auth/login"
        ) {
            // Token expired or invalid, logout user
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default ApiClient;
