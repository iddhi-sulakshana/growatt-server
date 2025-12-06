import type { Request } from "express";
import type { ZodError } from "zod";
import type { HttpStatusCode } from "./status-codes";

declare global {
    namespace Express {
        interface Request {
            // user?: ApiRequestUser;
            imageKey?: string;
        }

        interface Response {
            sendResponse<T>(
                response:
                    | DataResponse<T extends undefined ? undefined : T>
                    | DownloadResponse
                    | ViewResponse
                    | ApiError
                    | ZodError
                    | Error
            ): this | void;
        }
    }
}

export class ApiError extends Error {
    public status: HttpStatusCode;
    public data: any;

    constructor(message: string, status: HttpStatusCode, data?: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

// Add the user to the request object
// export type ApiRequestUser = {
//   id: number;
//   userType: UserType;
//   userStatus: UserStatus;
// };

export interface AuthRequest extends Request {
    // user: ApiRequestUser;
}

export interface ImageRequest extends Request {
    imageKey: string;
}

// Traditional offset-based pagination
export interface OffsetPagination {
    page: number;
    size: number;
    total: number;
    pages: number;
}

// Cursor-based pagination for infinite queries
export interface CursorPagination {
    cursor: number | null; // Next cursor for infinite scroll
    hasMore: boolean; // Whether there are more pages
    total: number; // Total count of items
    limit: number; // Current limit per page
}

// Union type for all pagination types
export type Pagination = OffsetPagination | CursorPagination;

type OutgoingHttpHeaders = {
    [header: string]: number | string | string[] | undefined;
};

export interface DataResponse<T = undefined> {
    message: string;
    data: T extends undefined ? undefined : T;
    pagination?: Pagination;
    status: HttpStatusCode;
    headers?: OutgoingHttpHeaders[];
}

export interface DownloadResponse {
    filePath: string;
    fileName: string;
    headers?: OutgoingHttpHeaders[];
}

export interface ViewResponse {
    filePath: string;
    headers?: OutgoingHttpHeaders[];
}

export const isDownloadResponse = (res: any): res is DownloadResponse => {
    return (
        typeof res?.filePath === "string" && typeof res?.fileName === "string"
    );
};

export const isViewResponse = (res: any): res is ViewResponse => {
    return typeof res?.filePath === "string";
};
