import type { DataResponse } from "@/types/api-contract";
import type { HealthReport } from "./dto";
import os from "os";
import HTTP_STATUS from "@/types/status-codes";
// import { checkDatabaseConnection } from "@/utils/db";
import { growatt } from "@/services/growatt-instance";

export async function checkHealthService(): Promise<
    DataResponse<HealthReport>
> {
    const response: HealthReport = {
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: {
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            usedMemory: os.totalmem() - os.freemem(),
        },
        cpuUsage: process.cpuUsage(),
        dependencies: {
            growatt: {
                status: "ISSUE",
                message: "Growatt is not running",
            },
            // Add any dependencies over here
            // Like external APIs
        },
        database: {
            status: "OK",
            message: "Database is not running",
        },
    };

    // const isDatabaseConnected = await checkDatabaseConnection();
    // if (isDatabaseConnected) {
    //     response.database.status = "OK";
    //     response.database.message = "Database is running";
    // }

    const isGrowattConnected = await growatt.isConnected();
    if (isGrowattConnected) {
        response.dependencies.growatt.status = "OK";
        response.dependencies.growatt.message =
            "Growatt connection is established";
    }

    return {
        message: "Server is running",
        status: HTTP_STATUS.OK,
        data: response,
    };
}
