import winston from "winston";
import { format } from "date-fns";

export default function configLogger() {
    // Define log colors for different log levels
    const colors = {
        error: "\x1b[31m", // Red
        warn: "\x1b[33m", // Yellow
        info: "\x1b[36m", // Cyan
        debug: "\x1b[32m", // Green
        silly: "\x1b[35m", // Magenta
        reset: "\x1b[0m", // Reset to default color
    };

    // Set the log level based on environment
    const logLevel = process.env.NODE_ENV === "development" ? "silly" : "info";

    // Add console transport for logging to the console
    winston.add(
        new winston.transports.Console({
            level: logLevel, // Set the log level
            format: winston.format.combine(
                // Include timestamp in logs
                winston.format.timestamp({
                    format: () => {
                        return `[${format(
                            new Date(),
                            "yyyy-MM-dd:HH.mm.ss.SSS"
                        )}]`;
                    },
                }),

                // Customize log format with colors and structured output
                winston.format.printf((log) => {
                    // @ts-ignore
                    const color = colors[log.level] || colors.info;
                    if (log.level === "error") {
                        // Format error messages with stack trace if available
                        let errorMsg = log.message || "An error occurred";

                        // If message is still empty/undefined, try to construct from error metadata
                        if (!log.message || log.message === "undefined") {
                            if (log.code === "EADDRINUSE") {
                                errorMsg = `Port is already in use (${log.syscall})`;
                            } else if (log.code) {
                                errorMsg = `Error: ${log.code}`;
                            }
                        }

                        if (log.stack) {
                            errorMsg += `\n${log.stack}`;
                        }
                        // If there's additional error metadata, include it
                        const metadata = Object.keys(log).filter(
                            (key) =>
                                ![
                                    "level",
                                    "message",
                                    "timestamp",
                                    "stack",
                                ].includes(key)
                        );
                        if (metadata.length > 0) {
                            const metaObj = metadata.reduce((acc, key) => {
                                acc[key] = log[key];
                                return acc;
                            }, {} as any);
                            errorMsg += `\nMetadata: ${JSON.stringify(
                                metaObj,
                                null,
                                2
                            )}`;
                        }
                        return `${
                            log.timestamp
                        } ${color}[${log.level.toUpperCase()}] : ${errorMsg}${
                            colors.reset
                        }`;
                    }
                    return `${
                        log.timestamp
                    } ${color}[${log.level.toUpperCase()}]${colors.reset} : ${
                        log.message
                    }`;
                })
            ),
        })
    );

    // thrown exceptions logging for files
    winston.exceptions.handle(
        new winston.transports.File({
            filename: "./logs/exceptions.log",
            format: winston.format.combine(
                winston.format.timestamp({
                    format: () => format(new Date(), "yyyy-MM-dd:HH.mm.ss.SSS"),
                }),
                winston.format.json()
            ),
        })
    );
    // Add a file transport for http logs
    winston.add(
        new winston.transports.File({
            level: "http",
            filename: "./logs/http.log",
            format: winston.format.combine(winston.format.json()),
        })
    );
    // Add a file transport for regular logs
    winston.add(
        new winston.transports.File({
            level: "info",
            filename: "./logs/logfile.log",
            format: winston.format.combine(
                winston.format.timestamp({
                    format: () => format(new Date(), "yyyy-MM-dd:HH.mm.ss.SSS"),
                }),
                winston.format.json() // Structured JSON logs
            ),
        })
    );

    return winston;
}

export function logRequestStream() {
    try {
        return {
            write: (message: string) => {
                const details = JSON.parse(message);
                const detailedMessage = `${details.method} ${details.status} ${details.url} ${details.contentLength} - ${details.responseTime} | ${details.remoteAddr} ${details.userAgent}`;
                winston.http(detailedMessage, {
                    method: details.method,
                    status: details.status,
                    url: details.url,
                    contentLength: details.contentLength,
                    responseTime: details.responseTime,
                    remoteAddr: details.remoteAddr,
                    userAgent: details.userAgent,
                });
            },
        };
    } catch (error) {
        winston.error("Error initializing log request stream", error);
    }
}
