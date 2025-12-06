import Redis from "ioredis";
import { ENV } from "./";
import winston from "winston";

let redisClient: Redis | null = null;

export function createRedisClient() {
    if (redisClient) {
        return redisClient;
    }

    redisClient = new Redis(ENV.REDIS_URL);

    redisClient.on("connect", () => {
        winston.info("Redis connection established ✅");
    });

    redisClient.on("error", (error) => {
        winston.error("Redis connection error ❌", error);
    });

    redisClient.on("close", () => {
        winston.info("Redis connection closed ❌");
    });

    redisClient.on("reconnecting", () => {
        winston.info("Redis connection reconnecting ⏳");
    });

    return redisClient;
}

export function getRedisClient() {
    if (!redisClient) {
        throw new Error("Redis client not initialized");
    }
    return redisClient;
}

export function closeRedisClient() {
    if (redisClient) {
        redisClient.quit();
    }
}
