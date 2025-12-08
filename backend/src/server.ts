import express from "express";
import "@/configs/response";
import cors from "cors";
import { configMorgan } from "./configs";
import { initializeRoutes } from "./routes";
import errorHandler from "./middlewares/error";

export default function initializeServer() {
    const app = express();

    // Enable cross origin resource sharing
    app.use(
        cors({
            origin: "*",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "ngrok-skip-browser-warning",
            ],
            credentials: true,
        })
    );

    // enable parse incoming requests with JSON payloads
    app.use(express.json());

    // enable parse incoming requests with URL-encoded payloads
    app.use(express.urlencoded({ extended: true }));

    // logging http requests with morgan
    configMorgan(app);

    // Mount the routes module
    initializeRoutes(app);

    // Handles all the uncaught errors in the requests
    app.use(errorHandler);

    return app;
}
