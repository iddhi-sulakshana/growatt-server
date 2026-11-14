import { expect, test } from "bun:test";
import { nextBackoffMs, parseSseChunk, shouldLogoutOnStatus } from "../src/lib/sse";

test("parses a complete status event", () => {
    expect(parseSseChunk('event: status\ndata: {"a":1}\n\n')).toEqual({
        events: [{ event: "status", data: '{"a":1}' }],
        rest: "",
    });
});

test("keeps a partial event until the rest arrives", () => {
    const first = parseSseChunk("event: status\nda");
    expect(first.events).toEqual([]);
    expect(first.rest).toBe("event: status\nda");
    const second = parseSseChunk(first.rest + 'ta: {"b":2}\n\n');
    expect(second.events).toEqual([{ event: "status", data: '{"b":2}' }]);
    expect(second.rest).toBe("");
});

test("ignores heartbeat comments", () => {
    expect(parseSseChunk(": ping\n\n")).toEqual({ events: [], rest: "" });
});

test("parses CRLF-separated events the same as LF", () => {
    expect(parseSseChunk('event: status\r\ndata: {"c":3}\r\n\r\n').events).toEqual([
        { event: "status", data: '{"c":3}' },
    ]);
});

test("parses several events in one chunk", () => {
    const { events } = parseSseChunk("event: status\ndata: 1\n\n: ping\n\nevent: status\ndata: 2\n\n");
    expect(events.map((e) => e.data)).toEqual(["1", "2"]);
});

test("only 401 logs out", () => {
    expect(shouldLogoutOnStatus(401)).toBe(true);
    expect(shouldLogoutOnStatus(502)).toBe(false);
    expect(shouldLogoutOnStatus(403)).toBe(false);
});

test("reconnect backoff grows to 10 s", () => {
    expect([0, 1, 2, 3, 4, 5].map(nextBackoffMs)).toEqual([1000, 2000, 5000, 10000, 10000, 10000]);
});
