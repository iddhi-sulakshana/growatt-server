import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getWeatherDataService } from "./service";
import { weatherRequestSchema } from "./dto";

const router: ExpressRouter = Router();

// Get weather data from Open-Meteo API
router.get("/", async (req, res) => {
    try {
        const validatedData = weatherRequestSchema.parse(req.query);
        const response = await getWeatherDataService(validatedData);
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

export default router;

