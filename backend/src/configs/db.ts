import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/database/schema";
import { Pool } from "pg";
import { ENV } from "./";

let poolInstance: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function initializeDatabase() {
    if (!poolInstance || !dbInstance) {
        const connectionString = ENV.DATABASE_URL;

        if (!connectionString) {
            throw new Error(
                "DATABASE_URL is required. Make sure ENV.configEnvironment() has been called."
            );
        }

        poolInstance = new Pool({
            connectionString: connectionString,
        });

        dbInstance = drizzle(poolInstance, { schema: schema });
    }
}

// Lazy initialization - initialize when first accessed
function getDb() {
    initializeDatabase();
    return dbInstance!;
}

// Create drizzle instance (lazy initialization)
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(_target, prop) {
        const db = getDb();
        const value = db[prop as keyof typeof db];
        return typeof value === "function" ? value.bind(db) : value;
    },
});

// Export the client for migrations (lazy initialization)
export function getPoolInstance(): Pool {
    initializeDatabase();
    return poolInstance!;
}

// Export pool for backward compatibility (lazy initialization)
export const pool = new Proxy({} as Pool, {
    get(_target, prop) {
        const pool = getPoolInstance();
        const value = pool[prop as keyof Pool];
        return typeof value === "function" ? value.bind(pool) : value;
    },
});
