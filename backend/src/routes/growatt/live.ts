import type { RequestHandler } from "express";
import winston from "winston";
import type { LiveDeviceStatus, LiveStatusStore } from "@/services/grobro/live-store";
import { createCoalescer } from "@/utils/coalesce";

/**
 * Server-Sent Events stream of the live device status. Sends the current status at
 * once, then each update (coalesced), a heartbeat comment, and, while local data is
 * stale, refreshes from the cloud so the client keeps getting fresh values.
 */
export function createLiveStreamHandler(deps: {
    store: LiveStatusStore;
    refresh: () => Promise<unknown>;
    coalesceMs?: number;
    heartbeatMs?: number;
    fallbackPollMs?: number;
}): RequestHandler {
    const { store, refresh, coalesceMs = 500, heartbeatMs = 15_000, fallbackPollMs = 5_000 } = deps;

    // One cloud poller shared by every open stream, running only while at least one is
    // open, with at most one refresh in flight: the Growatt client handles one request at
    // a time, and overlapping refreshes would queue up behind a slow cloud.
    let clients = 0;
    let refreshing = false;
    let poller: ReturnType<typeof setInterval> | null = null;
    const pollCloud = () => {
        if (refreshing || store.isLive()) return;
        refreshing = true;
        refresh()
            .catch((error) =>
                winston.warn(`Live stream: cloud refresh failed: ${error?.message ?? error}`)
            )
            .finally(() => {
                refreshing = false;
            });
    };
    const acquirePoller = () => {
        clients++;
        if (!poller) poller = setInterval(pollCloud, fallbackPollMs);
    };
    const releasePoller = () => {
        clients--;
        if (clients <= 0 && poller) {
            clearInterval(poller);
            poller = null;
            clients = 0;
        }
    };

    return (_req, res) => {
        res.status(200);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders();

        let closed = false;
        const send = (status: LiveDeviceStatus) => {
            if (!closed) res.write(`event: status\ndata: ${JSON.stringify(status)}\n\n`);
        };

        const initial = store.current();
        if (initial) send(initial);

        const coalescer = createCoalescer<LiveDeviceStatus>(coalesceMs, send);
        const unsubscribe = store.subscribe((status) => coalescer.push(status));

        const heartbeat = setInterval(() => {
            if (!closed) res.write(": ping\n\n");
        }, heartbeatMs);

        acquirePoller();

        // res "close", not req "close": on Node-compatible runtimes the request emits
        // "close" as soon as its (empty) body is read, which would end the stream at once.
        res.on("close", () => {
            if (closed) return;
            closed = true;
            clearInterval(heartbeat);
            releasePoller();
            coalescer.stop();
            unsubscribe();
        });
    };
}
