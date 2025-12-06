import type { Express } from "express";
import healthRouter from "./health/controller";
import authRouter from "./auth/controller";
import growattRouter from "./growatt/controller";

export function initializeRoutes(app: Express) {
    // Global API prefix
    const PREFIX = `/api/v1`;

    // Health check route
    app.use(`${PREFIX}/health`, healthRouter);

    // Auth routes
    app.use(`${PREFIX}/auth`, authRouter);

    // Growatt routes
    app.use(`${PREFIX}/growatt`, growattRouter);
}
