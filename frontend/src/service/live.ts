import { useEffect } from "react";
import queryClient from "@/lib/QueryClient";
import { useAuthStore } from "@/lib/AuthStore";
import { useLiveConnectionStore } from "@/lib/LiveConnectionStore";
import { nextBackoffMs, parseSseChunk, shouldLogoutOnStatus } from "@/lib/sse";
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
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/growatt/live`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
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
