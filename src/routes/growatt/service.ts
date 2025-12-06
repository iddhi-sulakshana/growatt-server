import type { DataResponse } from "@/types/api-contract";
import type { GrowattDeviceStatusResponse } from "./dto";
import HTTP_STATUS from "@/types/status-codes";
import { growatt } from "@/services/growatt-instance";
import winston from "winston";

export async function getDeviceStatusDataService(): Promise<
    DataResponse<GrowattDeviceStatusResponse>
> {
    try {
        const plantId = growatt.getPlantId();
        const device = growatt.getDevice();

        if (!plantId || !device) {
            return {
                message: "Growatt: Plant ID or device not available",
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }

        const data = await growatt.getPlantDeviceStatusData({
            plantId,
            device,
        });

        if (!data) {
            return {
                message: "Failed to retrieve device status data",
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }

        return {
            message: "Device status data retrieved successfully",
            status: HTTP_STATUS.OK,
            data,
        };
    } catch (error: any) {
        winston.error("Growatt: Get device status data failed", error);
        return {
            message: error.message || "Failed to retrieve device status data",
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            data: null,
        };
    }
}
