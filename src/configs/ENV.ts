import { z, ZodError } from "zod";

const envSchema = z.object({
    GROWATT_USERNAME: z.string(),
    GROWATT_PASSWORD: z.string(),
    GROWATT_SERVER: z.url(),
    REDIS_URL: z.url(),
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum(["development", "production"]),
    PORT: z.coerce.number().int().positive(),
    ADMIN_PASSWORD: z.string(),
});

export default class ENV {
    static GROWATT_USERNAME: string;
    static GROWATT_PASSWORD: string;
    static GROWATT_SERVER: string;
    static REDIS_URL: string;
    static DATABASE_URL: string;
    static NODE_ENV: "development" | "production";
    static PORT: number;
    static ADMIN_PASSWORD: string;
    public static configEnvironment() {
        try {
            if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";
            const env = envSchema.parse(process.env);
            this.GROWATT_USERNAME = env.GROWATT_USERNAME;
            this.GROWATT_PASSWORD = env.GROWATT_PASSWORD;
            this.GROWATT_SERVER = env.GROWATT_SERVER;
            this.REDIS_URL = env.REDIS_URL;
            this.DATABASE_URL = env.DATABASE_URL;
            this.NODE_ENV = env.NODE_ENV;
            this.PORT = env.PORT;
            this.ADMIN_PASSWORD = env.ADMIN_PASSWORD;
            console.log("Environment configuration loaded successfully");
        } catch (error) {
            const issues = (error as ZodError).issues.map((issue) => {
                const path = issue.path.join(".") || "body";
                const message =
                    issue.message.split(":")[1]?.trim() || issue.message;
                const code = issue.code;
                return {
                    path,
                    message,
                    code,
                };
            });
            console.error("Environment configuration errors:", issues);
            process.exit(1);
        }
    }
}
