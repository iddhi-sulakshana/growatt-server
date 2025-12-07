import { getDeviceStatusApi } from "@/api/growatt";
import { useQuery } from "@tanstack/react-query";

export const getDeviceStatusService = () => {
    return useQuery({
        queryKey: ["device-status"],
        queryFn: getDeviceStatusApi,
        // Refetch every 10 seconds
        refetchInterval: 10000,
    });
};
