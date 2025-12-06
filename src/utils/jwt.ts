import jwt from "jsonwebtoken";
import { ENV } from "@/configs";

export interface TokenPayload {
    id: number;
    username: string;
}

export function verifyAccessToken(token: string): TokenPayload {
    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error: any) {
        throw error;
    }
}

