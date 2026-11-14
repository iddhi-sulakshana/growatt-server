import { useEffect } from "react";
import queryClient from "@/lib/QueryClient";
import { useAuthStore } from "@/lib/AuthStore";
import { useLiveConnectionStore } from "@/lib/LiveConnectionStore";
import { nextBackoffMs, parseSseChunk, shouldLogoutOnStatus } from "@/lib/sse";
import { createWatchdog, STREAM_SILENCE_TIMEOUT_MS } from "@/lib/live-status";
import type { DeviceStatusData } from "@/types/growatt";

/**
 * Opens the backend's live status stream and writes each reading into the
 * ["device-status"] query cache, so every component using getDeviceStatusService
 * updates the moment a reading arrives. Reconnects with backoff; a 401 logs out.
 */
export function useLiveDeviceStatus(): void {
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (!token) return;

        const controller = new AbortController();
        const { setConnected } = useLiveConnectionStore.getState();
        let attempt = 0;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;

        const scheduleReconnect = () => {
            if (controller.signal.aborted) return;
            setConnected(false);
            retryTimer = setTimeout(connect, nextBackoffMs(attempt++));
        };

        const connect = async () => {
            // Per-connection abort, also fired by the effect's cleanup. The watchdog aborts
            // a connection that has gone silent (no event or heartbeat for 45 s), e.g. a
            // half-open socket after sleep, so it reconnects instead of freezing.
            const connection = new AbortController();
            const abortConnection = () => connection.abort();
            controller.signal.addEventListener("abort", abortConnection, { once: true });
            const watchdog = createWatchdog(STREAM_SILENCE_TIMEOUT_MS, abortConnection);
            watchdog.reset();
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/growatt/live`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: connection.signal,
                });
                if (shouldLogoutOnStatus(response.status)) {
                    setConnected(false);
                    useAuthStore.getState().logout();
                    return;
                }
                if (!response.ok || !response.body) {
                    scheduleReconnect();
                    return;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                for (;;) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    watchdog.reset();
                    buffer += decoder.decode(value, { stream: true });
                    const { events, rest } = parseSseChunk(buffer);
                    buffer = rest;
                    for (const event of events) {
                        if (event.event !== "status") continue;
                        let data: DeviceStatusData;
                        try {
                            data = JSON.parse(event.data);
                        } catch {
                            continue;
                        }
                        queryClient.setQueryData(["device-status"], {
                            status: 200,
                            message: "live",
                            data,
                        });
                        attempt = 0;
                        if (!useLiveConnectionStore.getState().connected) setConnected(true);
                    }
                }
                scheduleReconnect();
            } catch {
                scheduleReconnect();
            } finally {
                watchdog.stop();
                controller.signal.removeEventListener("abort", abortConnection);
            }
        };

        connect();

        return () => {
            controller.abort();
            clearTimeout(retryTimer);
            setConnected(false);
        };
    }, [token]);
}
