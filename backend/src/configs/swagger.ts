import type { Express } from "express";
import winston from "winston";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import ENV from "./ENV";
import { apiReference } from "@scalar/express-api-reference";

export default function configSwagger(app: Express) {
    if (ENV.NODE_ENV !== "development") {
        return;
    }

    try {
        const loadSwaggerFiles = (): object => {
            const swaggerSpecs: any = {
                openapi: "3.1.1",
                info: {
                    title: "Growatt Server",
                    version: "1.0.0",
                    description: "Complete API reference for Growatt Server",
                    ogDescription:
                        "Comprehensive API documentation with interactive client",
                },
                servers: [
                    {
                        url: `http://localhost:${ENV.PORT}/api/v1`,
                        description: "Local Development Server",
                    },
                ],
                paths: {},
                components: {
                    securitySchemes: {
                        BearerAuth: {
                            type: "http",
                            scheme: "bearer",
                            bearerFormat: "JWT",
                            description:
                                "Provide JWT token in the format: `Bearer <token>`",
                        },
                    },
                },
            };

            const routesDir = path.resolve(__dirname, "../routes");
            const routes = fs.readdirSync(routesDir);

            routes.forEach((route) => {
                const swaggerFile = fs.existsSync(
                    path.join(routesDir, route, "swagger.yaml")
                )
                    ? fs.readFileSync(
                          path.join(routesDir, route, "swagger.yaml"),
                          "utf8"
                      )
                    : null;
                if (!swaggerFile) return;

                const spec: any = yaml.load(swaggerFile);
                if (!spec) return;

                Object.assign(swaggerSpecs.paths, spec.paths || {});
            });

            return swaggerSpecs;
        };

        const swaggerSpec = loadSwaggerFiles();

        // Serve the raw swagger.json
        app.get("/swagger.json", (_, res) => {
            res.json(swaggerSpec);
        });

        // Initialize API Reference (Scalar - compatible with Express v5)
        app.use(
            "/scalar",
            apiReference({
                url: "/swagger.json",
                _integration: "express",
                authentication: {
                    preferredSecurityScheme: "BearerAuth",
                },
                defaultHttpClient: {
                    targetKey: "js",
                    clientKey: "axios",
                },
                pageTitle: "Growatt Server API Reference",
                hideModels: true,
                layout: "modern",
                hideDownloadButton: false,
                theme: "bluePlanet",
            })
        );
    } catch (error: any) {
        winston.error("Error initializing Swagger", error);
    }
}
