import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { checkHealthService } from "./service";
const router: ExpressRouter = Router();

router.get("/", async (_, res) => {
    try {
        const response = await checkHealthService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

export default router;
