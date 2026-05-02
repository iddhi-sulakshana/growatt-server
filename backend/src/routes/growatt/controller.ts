import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
    getAcOutputSourceService,
    getChargeSourceService,
    getDeviceStatusDataService,
    getHistoryDataService,
    getMaxChargeCurrentService,
    getPlantFaultLogService,
    getPlantWeatherDataService,
    getSubscriptionStatusService,
    getTotalDataService,
    reloginService,
    setAcOutputSourceService,
    setChargeSourceService,
    setMaxChargeCurrentService,
} from "./service";
import {
    historyDataRequestSchema,
    plantFaultLogRequestSchema,
    setAcOutputSourceRequestSchema,
    setChargeSourceRequestSchema,
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

// Get AC output source
router.get("/inverter-settings/ac-output-source", async (_, res) => {
    try {
        const response = await getAcOutputSourceService();
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

// Set AC output source (0=SBU, 1=Solar First, 2=Utility First, 3=SUB)
router.post("/inverter-settings/ac-output-source", async (req, res) => {
    try {
        const validatedData = setAcOutputSourceRequestSchema.parse(req.body);
        const response = await setAcOutputSourceService(validatedData);
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Get charge source (0=Solar First, 1=Solar and Utility, 2=Only Solar)
router.get("/inverter-settings/charge-source", async (_, res) => {
    try {
        const response = await getChargeSourceService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

// Set charge source (0=Solar First, 1=Solar and Utility, 2=Only Solar)
router.post("/inverter-settings/charge-source", async (req, res) => {
    try {
        const validatedData = setChargeSourceRequestSchema.parse(req.body);
        const response = await setChargeSourceService(validatedData);
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

export default router;
