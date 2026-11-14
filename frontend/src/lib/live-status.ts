/** A GroBro reading counts as live while it's younger than this (matches the backend). */
export const LIVE_READING_MAX_AGE_MS = 30_000;

/** The backend sends a heartbeat every 15 s; this much silence means the stream is dead. */
export const STREAM_SILENCE_TIMEOUT_MS = 45_000;

/**
 * Whether the dashboard is showing live local data: the reading came from GroBro and
 * reached this browser recently. `receivedAtMs` is the local time it arrived (0 = never).
 */
export function isLiveReading(
    source: string | undefined,
    receivedAtMs: number,
    nowMs: number
): boolean {
    return source === "grobro" && receivedAtMs > 0 && nowMs - receivedAtMs < LIVE_READING_MAX_AGE_MS;
}

/** Calls `onTimeout` once if `reset()` isn't called again within `timeoutMs`. */
export function createWatchdog(
    timeoutMs: number,
    onTimeout: () => void
): { reset(): void; stop(): void } {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return {
        reset() {
            clearTimeout(timer);
            timer = setTimeout(onTimeout, timeoutMs);
        },
        stop() {
            clearTimeout(timer);
            timer = undefined;
        },
    };
}
