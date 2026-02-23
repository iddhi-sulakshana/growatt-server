import { ApiError, type DataResponse } from "@/types/api-contract";
import type {
    GetAcOutputSourceResponse,
    GetMaxChargeCurrentResponse,
    GrowattDeviceStatusResponse,
    GrowattReloginResponse,
    GrowattSubscriptionStatusResponse,
    HistoryDataRequest,
    PlantFaultLogRequest,
    SetAcOutputSourceRequest,
    SetAcOutputSourceResponse,
    SetMaxChargeCurrentRequest,
    SetMaxChargeCurrentResponse,
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
import { SETTING_ACTIONS, STORAGE_SPF5000_SETTINGS } from "./inverter-settings";

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

export async function setMaxChargeCurrentService(
    payload: SetMaxChargeCurrentRequest
): Promise<DataResponse<SetMaxChargeCurrentResponse>> {
    try {
        const device = growatt.getDevice();

        if (!device) {
            throw new ApiError(
                "Growatt: Device not available",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const [deviceType] = device;

        // For storage devices, use direct tcpSet.do call
        if (deviceType === "storage") {
            const serialNum = growatt.getSerialNoOfDevice(device);
            const result = await growatt.setStorageSetting(
                SETTING_ACTIONS.STORAGE_SPF5000_SET,
                serialNum,
                STORAGE_SPF5000_SETTINGS.MAX_CHARGE_CURRENT,
                {
                    param1: payload.value.toString(),
                    param2: "",
                    param3: "",
                    param4: "",
                }
            );

            if (!result || result.success !== true) {
                throw new ApiError(
                    result?.msg?.toString() ||
                        "Failed to set max charge current",
                    HTTP_STATUS.INTERNAL_SERVER_ERROR
                );
            }

            return {
                message: "Max charge current set successfully",
                status: HTTP_STATUS.OK,
                data: {
                    success: true,
                    message: result.msg?.toString() || "Setting applied",
                },
            };
        } else {
            throw new ApiError(
                `Setting max charge current is not supported for device type: ${deviceType}`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    } catch (error: any) {
        winston.error("Growatt: Set max charge current failed", error);
        throw new ApiError(
            error.message || "Failed to set max charge current",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function getMaxChargeCurrentService(): Promise<
    DataResponse<GetMaxChargeCurrentResponse>
> {
    try {
        const device = growatt.getDevice();

        if (!device) {
            throw new ApiError(
                "Growatt: Device not available",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const [deviceType] = device;

        // For storage devices, use direct tcpSet.do call
        if (deviceType === "storage") {
            const serialNum = growatt.getSerialNoOfDevice(device);
            const result = await growatt.getStorageSetting(
                STORAGE_SPF5000_SETTINGS.MAX_CHARGE_CURRENT,
                serialNum
            );

            if (!result || result.success !== true) {
                throw new ApiError(
                    result?.msg?.toString() ||
                        "Failed to get max charge current",
                    HTTP_STATUS.INTERNAL_SERVER_ERROR
                );
            }

            // Parse the value from the response
            // The response msg typically contains the value
            const value = result.msg
                ? typeof result.msg === "number"
                    ? result.msg
                    : parseInt(result.msg.toString(), 10) || 0
                : 0;

            return {
                message: "Max charge current retrieved successfully",
                status: HTTP_STATUS.OK,
                data: {
                    value,
                },
            };
        } else {
            throw new ApiError(
                `Getting max charge current is not supported for device type: ${deviceType}`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    } catch (error: any) {
        winston.error("Growatt: Get max charge current failed", error);
        throw new ApiError(
            error.message || "Failed to get max charge current",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function getAcOutputSourceService(): Promise<
    DataResponse<GetAcOutputSourceResponse>
> {
    try {
        const device = growatt.getDevice();

        if (!device) {
            throw new ApiError(
                "Growatt: Device not available",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const [deviceType] = device;

        if (deviceType === "storage") {
            const serialNum = growatt.getSerialNoOfDevice(device);
            const result = await growatt.getStorageSetting(
                STORAGE_SPF5000_SETTINGS.AC_OUTPUT_SOURCE,
                serialNum
            );

            if (!result || result.success !== true) {
                throw new ApiError(
                    result?.msg?.toString() ||
                        "Failed to get AC output source",
                    HTTP_STATUS.INTERNAL_SERVER_ERROR
                );
            }

            const value = result.msg
                ? typeof result.msg === "number"
                    ? result.msg
                    : parseInt(result.msg.toString(), 10) || 0
                : 0;

            return {
                message: "AC output source retrieved successfully",
                status: HTTP_STATUS.OK,
                data: {
                    value,
                },
            };
        } else {
            throw new ApiError(
                `Getting AC output source is not supported for device type: ${deviceType}`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    } catch (error: any) {
        winston.error("Growatt: Get AC output source failed", error);
        throw new ApiError(
            error.message || "Failed to get AC output source",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export async function setAcOutputSourceService(
    payload: SetAcOutputSourceRequest
): Promise<DataResponse<SetAcOutputSourceResponse>> {
    try {
        const device = growatt.getDevice();

        if (!device) {
            throw new ApiError(
                "Growatt: Device not available",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const [deviceType] = device;

        if (deviceType === "storage") {
            const serialNum = growatt.getSerialNoOfDevice(device);
            const result = await growatt.setStorageSetting(
                SETTING_ACTIONS.STORAGE_SPF5000_SET,
                serialNum,
                STORAGE_SPF5000_SETTINGS.AC_OUTPUT_SOURCE,
                {
                    param1: payload.value.toString(),
                    param2: "",
                    param3: "",
                    param4: "",
                }
            );

            if (!result || result.success !== true) {
                throw new ApiError(
                    result?.msg?.toString() ||
                        "Failed to set AC output source",
                    HTTP_STATUS.INTERNAL_SERVER_ERROR
                );
            }

            return {
                message: "AC output source set successfully",
                status: HTTP_STATUS.OK,
                data: {
                    success: true,
                    message: result.msg?.toString() || "Setting applied",
                },
            };
        } else {
            throw new ApiError(
                `Setting AC output source is not supported for device type: ${deviceType}`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    } catch (error: any) {
        winston.error("Growatt: Set AC output source failed", error);
        throw new ApiError(
            error.message || "Failed to set AC output source",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}
