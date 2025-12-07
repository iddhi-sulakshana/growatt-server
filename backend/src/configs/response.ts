import { response } from "express";

import {
    isDownloadResponse,
    isViewResponse,
    type DataResponse,
    type DownloadResponse,
    type ViewResponse,
    ApiError,
} from "@/types/api-contract";
import winston from "winston";
import { ZodError } from "zod";
import HTTP_STATUS from "@/types/status-codes";
import { ENV } from "./";

response.sendResponse = function <T>(
    response:
        | DataResponse<T extends undefined ? undefined : T>
        | DownloadResponse
        | ViewResponse
        | ApiError
        | ZodError
        | Error
) {
    // Handle Zod validation errors
    if (response instanceof ZodError) {
        console.log(response);
        return this.status(HTTP_STATUS.BAD_REQUEST).send({
            status: HTTP_STATUS.BAD_REQUEST,
            message: "Validation error",
            data: response.issues.map((issue) => {
                const path = issue.path.join(".") || "body";
                const message =
                    issue.message.split(":")[1]?.trim() || issue.message;
                const code = issue.code;
                return {
                    path,
                    message,
                    code,
                };
            }),
        });
    }

    // If the response is handled api error send error details
    if (response instanceof ApiError) {
        if (ENV.NODE_ENV != "production") winston.error(response.message);
        return this.status(response.status).send({
            status: response.status,
            message: response.message,
        });
    }

    // Check if the response is generic error then throw server error
    if (response instanceof Error) {
        if (ENV.NODE_ENV != "production") console.error(response);
        winston.error(
            `Error sending request: [${this.req.originalUrl}] : ` +
                response.message,
            response
        );
        return this.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        });
    }

    // If the response has the headers set them
    if (response.headers) {
        if (Array.isArray(response.headers)) {
            response.headers.forEach((header: any) => {
                this.set(header.name, header.value);
            });
            this.set(
                "Access-Control-Expose-Headers",
                response.headers.map((header: any) => header.name).join(", ")
            );
        }
    }

    if (isDownloadResponse(response)) {
        return this.download(response.filePath, response.fileName, (err) => {
            if (err) {
                winston.error(
                    `Download Error: [${this.req.originalUrl}] : ` +
                        err.message,
                    err
                );
                if (!this.headersSent) {
                    this.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
                        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                        message: "Internal Server Error",
                    });
                }
            }
        });
    }

    if (isViewResponse(response)) {
        return this.sendFile(response.filePath, (err) => {
            if (err) {
                winston.error(
                    `Send File Error: [${this.req.originalUrl}] : ` +
                        err.message,
                    err
                );
                if (!this.headersSent) {
                    this.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
                        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                        message: "Internal Server Error",
                    });
                }
            }
        });
    }

    return this.status(response.status).send({
        status: response.status,
        message: response.message,
        data: response.data,
        ...(response.pagination && { pagination: response.pagination }),
    });
};
