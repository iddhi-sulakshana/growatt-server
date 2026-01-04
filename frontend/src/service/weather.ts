import { getWeatherApi } from "@/api/weather";
import { useQuery } from "@tanstack/react-query";

export const getWeatherService = (params?: {
    latitude?: number;
    longitude?: number;
    timezone?: string;
}) => {
    return useQuery({
        queryKey: ["weather", params?.latitude, params?.longitude, params?.timezone],
        queryFn: () => getWeatherApi(params),
        // Refetch every 10 minutes (weather doesn't change that frequently)
        refetchInterval: 10 * 60 * 1000,
    });
};

