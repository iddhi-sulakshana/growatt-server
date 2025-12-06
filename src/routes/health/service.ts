import type { DataResponse } from "@/types/api-contract";
import type { HealthReport } from "./dto";
import os from "os";
import HTTP_STATUS from "@/types/status-codes";
import { checkDatabaseConnection } from "@/utils/db";

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
            // Add any dependencies over here
            // Like external APIs
        },
        database: {
            status: "ISSUE",
            message: "Database is not running",
        },
    };

    const isDatabaseConnected = await checkDatabaseConnection();
    if (isDatabaseConnected) {
        response.database.status = "OK";
        response.database.message = "Database is running";
    }

    return {
        message: "Server is running",
        status: HTTP_STATUS.OK,
        data: response,
    };
}
