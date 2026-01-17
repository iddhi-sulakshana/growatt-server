import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
    getDeviceStatusDataService,
    getHistoryDataService,
    getMaxChargeCurrentService,
    getPlantFaultLogService,
    getPlantWeatherDataService,
    getSubscriptionStatusService,
    getTotalDataService,
    reloginService,
    setMaxChargeCurrentService,
} from "./service";
import {
    historyDataRequestSchema,
    plantFaultLogRequestSchema,
    setMaxChargeCurrentRequestSchema,
} from "./dto";
import { getAvailableSettingTypes } from "./inverter-settings";

const router: ExpressRouter = Router();

// Get the status of the device
router.get("/device-status", async (_, res) => {
    try {
        const response = await getDeviceStatusDataService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Get the total data of the device
router.get("/total-data", async (_, res) => {
    try {
        const response = await getTotalDataService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Get the history data of the device
router.get("/history-data", async (req, res) => {
    try {
        const validatedData = historyDataRequestSchema.parse(req.query);
        const response = await getHistoryDataService(validatedData);
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Relogin to the Growatt server
router.post("/relogin", async (_, res) => {
    try {
        const response = await reloginService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Get the current subscription status
router.get("/subscription-status", async (_, res) => {
    try {
        const response = await getSubscriptionStatusService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Get the plant weather data
router.get("/plant-weather-data", async (_, res) => {
    try {
        const response = await getPlantWeatherDataService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Get the plant fault log
router.get("/plant-fault-log", async (req, res) => {
    try {
        const validatedData = plantFaultLogRequestSchema.parse(req.query);
        const response = await getPlantFaultLogService(validatedData);
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Get available inverter setting types
router.get("/inverter-settings/types", async (_, res) => {
    try {
        const types = getAvailableSettingTypes();
        res.sendResponse({
            message: "Available setting types retrieved successfully",
            status: 200,
            data: types,
        });
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Get max charge current
router.get("/inverter-settings/max-charge-current", async (_, res) => {
    try {
        const response = await getMaxChargeCurrentService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Set max charge current
router.post("/inverter-settings/max-charge-current", async (req, res) => {
    try {
        const validatedData = setMaxChargeCurrentRequestSchema.parse(req.body);
        const response = await setMaxChargeCurrentService(validatedData);
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

export default router;
