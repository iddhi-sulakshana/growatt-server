import type { HttpStatusCode } from "./status-codes";

export interface Pagination {
    page: number;
    size: number;
    total: number;
    pages: number;
}

export interface DataResponse<T = undefined> {
    message: string;
    data: T extends undefined ? undefined : T;
    pagination?: Pagination;
    status: HttpStatusCode;
}
