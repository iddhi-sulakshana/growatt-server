import ApiClient from "@/lib/ApiClient";
import type { DataResponse } from "@/types/api-contract";
import type { GrowattDeviceStatusResponse } from "@/types/growatt";

export const getDeviceStatusApi = async () => {
    const response = await ApiClient.get<
        DataResponse<GrowattDeviceStatusResponse>
    >("/growatt/device-status");

    return response.data;
};
