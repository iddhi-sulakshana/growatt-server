import { z } from "zod";
import type { DeviceStatusData } from "@/types/types";

export const historyDataRequestSchema = z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    start: z.coerce
        .number()
        .min(0, "Start page number is required")
        .optional()
        .default(0),
});

export type HistoryDataRequest = z.infer<typeof historyDataRequestSchema>;

export type GrowattDeviceStatusResponse = DeviceStatusData | null;

export type GrowattReloginResponse = {
    connected: boolean;
    plantId: string | null;
    device: string | null;
};

export type GrowattSubscriptionStatusResponse = {
    connected: boolean;
    plantId: string | null;
    device: string | null;
};

export const plantFaultLogRequestSchema = z.object({
    date: z.string().min(1, "Date is required"),
    toPageNum: z.coerce
        .number()
        .min(1, "To page number is required")
        .optional()
        .default(1),
});

export type PlantFaultLogRequest = z.infer<typeof plantFaultLogRequestSchema>;

export const setMaxChargeCurrentRequestSchema = z.object({
    value: z.coerce
        .number()
        .int("Value must be an integer")
        .min(0, "Value must be greater than or equal to 0")
        .max(100, "Value must be less than or equal to 100"),
});

export type SetMaxChargeCurrentRequest = z.infer<
    typeof setMaxChargeCurrentRequestSchema
>;

export type SetMaxChargeCurrentResponse = {
    success: boolean;
    message: string;
};

export type GetMaxChargeCurrentResponse = {
    value: number;
};
