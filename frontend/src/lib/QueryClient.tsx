import { QueryClient } from "@tanstack/react-query";

export default new QueryClient({
    defaultOptions: {
        queries: {
            retry: true, // retry 3 times if the query fails
            retryDelay: 5000, // delay 5 seconds between retries

            refetchOnMount: true,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            refetchIntervalInBackground: true,
        },
        mutations: {
            retry: true,
            retryDelay: 5000,
        },
    },
});
