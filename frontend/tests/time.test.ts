import { expect, test } from "bun:test";
import { formatUpdatedAt } from "../src/lib/time";

test("formats an ISO time as local HH:mm:ss.SSS", () => {
    const iso = new Date(2026, 10, 14, 12, 27, 5, 123).toISOString();
    expect(formatUpdatedAt(iso)).toBe("12:27:05.123");
});

test("pads hours, minutes, seconds and milliseconds", () => {
    const iso = new Date(2026, 10, 14, 7, 3, 9, 7).toISOString();
    expect(formatUpdatedAt(iso)).toBe("07:03:09.007");
});

test("missing or invalid times give null", () => {
    expect(formatUpdatedAt(undefined)).toBeNull();
    expect(formatUpdatedAt("")).toBeNull();
    expect(formatUpdatedAt("not a date")).toBeNull();
});
