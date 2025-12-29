import type { NextFunction, Request, Response } from "express";
import HTTP_STATUS from "@/types/status-codes";
import { verifyAccessToken } from "@/utils/jwt";
import winston from "winston";
// import { AdminRepository } from "@/database/repositories";

// const adminRepository = new AdminRepository();

export type ApiRequestUser = {
    id: number;
    username: string;
};

export function authorize() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token: string | undefined;

            // Get the authorization header from the request
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }

            // If no token in Authorization header, check for the query parameters
            if (!token) {
                token = req.query.accessToken as string | undefined;

                if (!token) {
                    return res.sendResponse({
                        status: HTTP_STATUS.UNAUTHORIZED,
                        message: "Access denied: No token provided",
                        data: undefined,
                    });
                }
            }

            // Verify the JWT token
            const decoded = verifyAccessToken(token);

            // // Retrieve the admin from the database
            // const adminUser = await adminRepository.findById(decoded.id);

            // if (!adminUser) {
            //     return res.sendResponse({
            //         status: HTTP_STATUS.UNAUTHORIZED,
            //         message: "Access denied: User not found",
            //         data: undefined,
            //     });
            // }

            // Attach the user to the request object
            // req.user = {
            //     id: adminUser.id,
            //     username: adminUser.username,
            // };

            req.user = {
                id: decoded.id,
                username: decoded.username,
            };

            next();
        } catch (error: any) {
            // Handle specific token errors (expired, invalid, etc)
            if (error.name === "TokenExpiredError") {
                return res.sendResponse({
                    status: HTTP_STATUS.UNAUTHORIZED,
                    message: "Token expired: token rotation required",
                    data: undefined,
                });
            }

            if (error.name === "JsonWebTokenError") {
                return res.sendResponse({
                    status: HTTP_STATUS.UNAUTHORIZED,
                    message: "Access denied: Invalid token",
                    data: undefined,
                });
            }

            winston.error(error.message, error);
            res.sendResponse({
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                message: "Uncaught Error",
                data: undefined,
            });
        }
    };
}
