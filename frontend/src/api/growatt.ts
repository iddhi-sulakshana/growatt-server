import ApiClient from "@/lib/ApiClient";
import type { DataResponse } from "@/types/api-contract";
import type {
    DeviceTotalData,
    GrowattDeviceStatusResponse,
} from "@/types/growatt";

export const getDeviceStatusApi = async () => {
    const response = await ApiClient.get<
        DataResponse<GrowattDeviceStatusResponse>
    >("/growatt/device-status");

    return response.data;
};

export const getTotalDataApi = async () => {
    const response = await ApiClient.get<DataResponse<DeviceTotalData>>(
        "/growatt/total-data"
    );

    return response.data;
};
