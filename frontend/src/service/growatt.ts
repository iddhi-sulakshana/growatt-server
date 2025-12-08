import { getDeviceStatusApi, getTotalDataApi } from "@/api/growatt";
import { useQuery } from "@tanstack/react-query";

export const getDeviceStatusService = () => {
    return useQuery({
        queryKey: ["device-status"],
        queryFn: getDeviceStatusApi,
        // Refetch every 10 seconds
        refetchInterval: 10000,
    });
};

export const getTotalDataService = () => {
    return useQuery({
        queryKey: ["total-data"],
        queryFn: getTotalDataApi,
        // Refetch every 5 minutes
        refetchInterval: 5 * 60 * 1000,
    });
};
