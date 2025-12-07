import type { Express } from "express";
import { format } from "date-fns";
import morgan from "morgan";
import { logRequestStream } from "./logger";

export default function configMorgan(app: Express) {
    morgan.token("time", () => {
        return format(new Date(), "yyyy-MM-dd:HH.mm.ss.SSS");
    });

    morgan.token("short-agent", (req) => {
        const ua = req.headers["user-agent"] || "";
        if (ua.includes("Chrome")) return "Chrome";
        if (ua.includes("Firefox")) return "Firefox";
        if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
        if (ua.includes("Edge")) return "Edge";
        return "Unknown";
    });

    app.use(
        morgan(
            (tokens, req, res) => {
                return JSON.stringify({
                    time: tokens["time"](req, res),
                    method: tokens.method(req, res),
                    url: tokens.url(req, res),
                    status: tokens.status(req, res),
                    responseTime: tokens["response-time"](req, res) + " ms",
                    contentLength: tokens.res(req, res, "content-length"),
                    remoteAddr: tokens["remote-addr"](req, res),
                    userAgent: tokens["short-agent"](req, res),
                });
            },
            { stream: logRequestStream() }
        )
    );
}
