import ApiClient from "@/lib/ApiClient";
import type { DataResponse } from "@/types/api-contract";
import type {
    DeviceHistoryDataList,
    DeviceTotalData,
    GrowattDeviceStatusResponse,
    GrowattReloginResponse,
    HistoryDataRequest,
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

export const getHistoryDataApi = async (payload: HistoryDataRequest) => {
    const response = await ApiClient.get<DataResponse<DeviceHistoryDataList>>(
        "/growatt/history-data",
        {
            params: payload,
        }
    );

    return response.data;
};

export const getMaxChargeCurrentApi = async () => {
    const response = await ApiClient.get<DataResponse<{ value: number }>>(
        "/growatt/inverter-settings/max-charge-current"
    );

    return response.data;
};

export const getAcOutputSourceApi = async () => {
    const response = await ApiClient.get<DataResponse<{ value: number }>>(
        "/growatt/inverter-settings/ac-output-source"
    );

    return response.data;
};

export const setMaxChargeCurrentApi = async (value: number) => {
    const response = await ApiClient.post<
        DataResponse<{ success: boolean; message: string }>
    >("/growatt/inverter-settings/max-charge-current", {
        value,
    });

    return response.data;
};

/** AC output source: 0=SBU Priority, 1=Solar First, 2=Utility First, 3=SUB Priority */
export const setAcOutputSourceApi = async (value: number) => {
    const response = await ApiClient.post<
        DataResponse<{ success: boolean; message: string }>
    >("/growatt/inverter-settings/ac-output-source", {
        value,
    });

    return response.data;
};

export const reloginGrowattApi = async () => {
    const response = await ApiClient.post<
        DataResponse<GrowattReloginResponse>
    >("/growatt/relogin");

    return response.data;
};
