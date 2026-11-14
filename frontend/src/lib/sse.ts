// Pure helpers for reading the backend's Server-Sent Events stream with fetch.
// (EventSource can't send the Bearer header, so the stream is read by hand.)

export type SseEvent = { event: string; data: string };

/**
 * Splits buffered stream text into complete events. Whatever follows the last
 * blank line is returned as `rest` to prepend to the next chunk. Comment lines
 * (heartbeats, ": ping") are dropped.
 */
export function parseSseChunk(buffer: string): { events: SseEvent[]; rest: string } {
    const normalized = buffer.replace(/\r\n?/g, "\n");
    const blocks = normalized.split("\n\n");
    const rest = blocks.pop() ?? "";
    const events: SseEvent[] = [];

    for (const block of blocks) {
        let event = "message";
        const data: string[] = [];
        for (const line of block.split("\n")) {
            if (line === "" || line.startsWith(":")) continue;
            const colon = line.indexOf(":");
            const field = colon === -1 ? line : line.slice(0, colon);
            const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
            if (field === "event") event = value;
            else if (field === "data") data.push(value);
        }
        if (data.length > 0) events.push({ event, data: data.join("\n") });
    }

    return { events, rest };
}

/** A 401 means the session is gone: log out instead of reconnecting. */
export function shouldLogoutOnStatus(status: number): boolean {
    return status === 401;
}

const BACKOFF_MS = [1000, 2000, 5000, 10000];

/** Delay before reconnect attempt `attempt` (0-based). */
export function nextBackoffMs(attempt: number): number {
    return BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
}
