import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getDeviceStatusDataService } from "./service";

const router: ExpressRouter = Router();

router.get("/device-status", async (_, res) => {
    try {
        const response = await getDeviceStatusDataService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

export default router;
