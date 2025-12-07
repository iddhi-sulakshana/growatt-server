export type HealthReport = {
    status: "OK" | "DATABASE_ISSUE" | "SERVER_ISSUE";
    message: string;
    timestamp: string;
    uptime: number;
    memoryUsage: {
        totalMemory: number;
        freeMemory: number;
        usedMemory: number;
    };
    cpuUsage: {
        user: number;
    };
    dependencies: {
        [key: string]: {
            status: "OK" | "ISSUE";
            message: string;
        };
    };
    database: {
        status: "OK" | "ISSUE";
        message: string;
    };
};
