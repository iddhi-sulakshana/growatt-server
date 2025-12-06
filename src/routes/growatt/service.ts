import { ApiError, type DataResponse } from "@/types/api-contract";
import type {
    GrowattDeviceStatusResponse,
    GrowattReloginResponse,
    GrowattSubscriptionStatusResponse,
    HistoryDataRequest,
    PlantFaultLogRequest,
} from "./dto";
import HTTP_STATUS from "@/types/status-codes";
import { growatt } from "@/services/growatt-instance";
import winston from "winston";
import type {
    DeviceHistoryDataList,
    DeviceTotalData,
    FaultLog,
    Weather,
} from "@/types/types";

export async function getDeviceStatusDataService(): Promise<
    DataResponse<GrowattDeviceStatusResponse>
> {
    try {
        const plantId = growatt.getPlantId();
        const device = growatt.getDevice();

        if (!plantId || !device) {
            throw new ApiError(
                "Growatt: Plant ID or device not available",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const data = await growatt.getPlantDeviceStatusData({
            plantId,
            device,
        });

        if (!data) {
            throw new ApiError(
                "Failed to retrieve device status data",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        return {
            message: "Device status data retrieved successfully",
            status: HTTP_STATUS.OK,
            data,
        };
    } catch (error: any) {
        winston.error("Growatt: Get device status data failed", error);
        throw new ApiError(
            error.message || "Failed to retrieve device status data",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function getTotalDataService(): Promise<
    DataResponse<DeviceTotalData>
> {
    try {
        const plantId = growatt.getPlantId();
        const device = growatt.getDevice();

        if (!plantId || !device) {
            throw new ApiError(
                "Growatt: Plant ID or device not available",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const data = await growatt.getPlantDeviceTotalData({
            plantId,
            device,
        });

        if (!data) {
            throw new ApiError(
                "Failed to retrieve total data",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        return {
            message: "Total data retrieved successfully",
            status: HTTP_STATUS.OK,
            data,
        };
    } catch (error: any) {
        winston.error("Growatt: Get total data failed", error);
        throw new ApiError(
            error.message || "Failed to retrieve total data",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function reloginService(): Promise<
    DataResponse<GrowattReloginResponse>
> {
    try {
        await growatt.relogin();
        const isConnected = growatt.isConnected();
        const plantId = growatt.getPlantId();
        const device = growatt.getDevice();

        return {
            message: isConnected
                ? "Re-login successful"
                : "Re-login completed but connection status is unknown",
            status: isConnected
                ? HTTP_STATUS.OK
                : HTTP_STATUS.INTERNAL_SERVER_ERROR,
            data: {
                connected: isConnected,
                plantId: plantId,
                device: device ? `${device[0]}-${device[1]}` : null,
            },
        };
    } catch (error: any) {
        winston.error("Growatt: Re-login failed", error);
        throw new ApiError(
            error.message || "Failed to re-login",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function getSubscriptionStatusService(): Promise<
    DataResponse<GrowattSubscriptionStatusResponse>
> {
    const isConnected = growatt.isConnected();
    const plantId = growatt.getPlantId();
    const device = growatt.getDevice();

    if (!isConnected || !plantId || !device) {
        throw new ApiError(
            "Growatt: Subscription status not available",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }

    return {
        message: "Subscription status retrieved successfully",
        status: HTTP_STATUS.OK,
        data: {
            connected: isConnected,
            plantId: plantId,
            device: device ? `${device[0]}-${device[1]}` : null,
        },
    };
}

export async function getHistoryDataService(
    payload: HistoryDataRequest
): Promise<DataResponse<DeviceHistoryDataList>> {
    try {
        const plantId = growatt.getPlantId();
        const device = growatt.getDevice();

        if (!plantId || !device) {
            throw new ApiError(
                "Growatt: Plant ID or device not available",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const data = await growatt.getPlantDeviceHistoryData({
            plantId,
            device,
            startDate: new Date(payload.startDate),
            endDate: new Date(payload.endDate),
            start: payload.start,
        });

        if (!data) {
            throw new ApiError(
                "Failed to retrieve history data",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        return {
            message: "History data retrieved successfully",
            status: HTTP_STATUS.OK,
            data,
        };
    } catch (error: any) {
        winston.error("Growatt: Get history data failed", error);
        throw new ApiError(
            error.message || "Failed to retrieve history data",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function getPlantWeatherDataService(): Promise<
    DataResponse<Weather>
> {
    try {
        const plantId = growatt.getPlantId();

        if (!plantId) {
            throw new ApiError(
                "Growatt: Plant ID not available",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const data = await growatt.getWeatherByPlantId(plantId);
        if (!data) {
            throw new ApiError(
                "Failed to retrieve plant weather data",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        return {
            message: "Plant weather data retrieved successfully",
            status: HTTP_STATUS.OK,
            data,
        };
    } catch (error: any) {
        winston.error("Growatt: Get plant weather data failed", error);
        throw new ApiError(
            error.message || "Failed to retrieve plant weather data",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function getPlantFaultLogService(
    payload: PlantFaultLogRequest
): Promise<DataResponse<FaultLog>> {
    try {
        const plantId = growatt.getPlantId();
        const device = growatt.getDevice();

        if (!plantId || !device) {
            throw new ApiError(
                "Growatt: Plant ID or device not available",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const data = await growatt.getNewPlantFaultLog({
            plantId,
            date: new Date(payload.date).toISOString().split("T")[0],
            deviceSn: device[0],
            toPageNum: payload.toPageNum,
        });

        if (!data) {
            throw new ApiError(
                "Failed to retrieve plant fault log",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        return {
            message: "Plant fault log retrieved successfully",
            status: HTTP_STATUS.OK,
            data,
        };
    } catch (error: any) {
        winston.error("Growatt: Get plant fault log failed", error);
        throw new ApiError(
            error.message || "Failed to retrieve plant fault log",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}
