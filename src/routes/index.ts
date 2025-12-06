import type { Express } from "express";
import healthRouter from "./health/controller";

export function initializeRoutes(app: Express) {
    // Global API prefix
    const PREFIX = `/api/v1`;

    // Health check route
    app.use(`${PREFIX}/health`, healthRouter);
}
