import { QueryClient } from "@tanstack/react-query";

export default new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,

            refetchOnMount: true,
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,

            refetchInterval: 0,
            gcTime: 0,
            staleTime: 0,
        },
        mutations: {
            retry: false,
        },
    },
});
