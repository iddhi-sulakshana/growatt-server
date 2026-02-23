import {
    getDeviceStatusApi,
    getTotalDataApi,
    getHistoryDataApi,
    getMaxChargeCurrentApi,
    getAcOutputSourceApi,
    setMaxChargeCurrentApi,
    setAcOutputSourceApi,
} from "@/api/growatt";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { DeviceHistoryData } from "@/types/growatt";

export const getDeviceStatusService = () => {
    return useQuery({
        queryKey: ["device-status"],
        queryFn: getDeviceStatusApi,
        // Refetch every 5 seconds
        refetchInterval: 5000,
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

const fetchAllHistoryData = async (params: {
    startDate: string;
    endDate: string;
}): Promise<DeviceHistoryData[]> => {
    const allData: DeviceHistoryData[] = [];
    let currentStart = 0;
    let hasMore = true;

    while (hasMore) {
        const response = await getHistoryDataApi({
            startDate: params.startDate,
            endDate: params.endDate,
            start: currentStart,
        });

        if (response.data) {
            allData.push(...response.data.datas);
            hasMore = response.data.haveNext;
            currentStart = response.data.start;
        } else {
            hasMore = false;
        }
    }

    return allData;
};

export const getHistoryDataService = (
    params: { startDate: string; endDate: string },
    enabled: boolean,
) => {
    return useQuery({
        queryKey: ["history-data", params.startDate, params.endDate],
        queryFn: () => fetchAllHistoryData(params),
        enabled: enabled && !!params.startDate && !!params.endDate,
    });
};

export const getMaxChargeCurrentService = () => {
    return useQuery({
        queryKey: ["max-charge-current"],
        queryFn: getMaxChargeCurrentApi,
        // Dont refetch unless manually triggered
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        refetchInterval: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

export const getAcOutputSourceService = () => {
    return useQuery({
        queryKey: ["ac-output-source"],
        queryFn: getAcOutputSourceApi,
        // Dont refetch unless manually triggered
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        refetchInterval: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

export const useSetMaxChargeCurrent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: setMaxChargeCurrentApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["max-charge-current"] });
            toast.success("Max charge current set successfully");
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ||
                    "Failed to set max charge current",
            );
        },
    });
};

export const useSetAcOutputSource = () => {
    return useMutation({
        mutationFn: setAcOutputSourceApi,
        onSuccess: () => {
            toast.success("AC output source set successfully");
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ||
                    "Failed to set AC output source",
            );
        },
    });
};
