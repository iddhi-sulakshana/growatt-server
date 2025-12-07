import { configLogger, ENV, redis } from "./configs";
import initializeServer from "./server";
import { checkDatabaseConnection } from "./utils/db";
import { growatt } from "./services/growatt-instance";

async function main() {
    ENV.configEnvironment();
    const logger = configLogger();

    // Initialize the Redis client
    redis.createRedisClient();

    // Initialize Growatt connection
    logger.info("Initializing Growatt connection...");
    try {
        await growatt.login();
        if (growatt.isConnected()) {
            logger.info("Growatt connection established successfully ✅");
        } else {
            logger.warn("Growatt connection failed, but continuing...");
        }
    } catch (error: any) {
        console.error(error);
        logger.error("Failed to initialize Growatt connection:", error.message);
        logger.warn("Continuing without Growatt connection...");
    }

    // Initialize Express App
    const app = initializeServer();

    // Wait for the database connection to be established
    logger.info("Waiting for database connection...");
    try {
        await Promise.race([
            (async () => {
                // Small delay before first connection attempt
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const isDatabaseConnected = await checkDatabaseConnection();
                if (!isDatabaseConnected) {
                    throw new Error("Failed to connect to the database");
                }
                logger.info("Database connection handshake successful ✅");
            })(),
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("Database connection timeout")),
                    10000
                )
            ),
        ]);
    } catch (error: any) {
        logger.error("Failed to connect to the database. Exiting... ❌");
        logger.error(error.message);
        process.exit(1);
    }

    // Start the server
    const server = app.listen(ENV.PORT, (error) => {
        if (error) {
            logger.error(error);
            process.exit(1);
        }
        logger.info(`Server listening on: http://localhost:${ENV.PORT}`);
    });

    // Handle server errors (like EADDRINUSE)
    server.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
            logger.error(
                `Port ${ENV.PORT} is already in use. Please free up the port or use a different one.`
            );
            logger.info(
                `To find the process using port ${ENV.PORT}, run: lsof -i :${ENV.PORT}`
            );
            logger.info(`To kill the process, run: kill -9 <PID>`);
        } else {
            logger.error("Server error:", error);
        }
        process.exit(1);
    });
    // Graceful Shutdown
    const shutdown = () => {
        const time = new Date().toISOString();
        logger.info(`Shutting down server at ${time}`);

        server.close(() => {
            logger.warn("Forcing shutdown after 10 seconds.");
            process.exit(1);
        });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}

main().catch((error) => {
    const logger = configLogger();
    logger.error("Failed to start application:", error);
    console.error("Fatal Error:", error);
    process.exit(1);
});
