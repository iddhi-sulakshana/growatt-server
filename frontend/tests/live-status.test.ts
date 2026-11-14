import { expect, test } from "bun:test";
import {
    createWatchdog,
    isLiveReading,
    LIVE_READING_MAX_AGE_MS,
    STREAM_SILENCE_TIMEOUT_MS,
} from "../src/lib/live-status";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("a GroBro reading received under 30 s ago is live", () => {
    expect(LIVE_READING_MAX_AGE_MS).toBe(30_000);
    expect(isLiveReading("grobro", 1_000, 1_000 + 29_999)).toBe(true);
});

test("a GroBro reading 30 s old or more is not live (the stream went quiet)", () => {
    expect(isLiveReading("grobro", 1_000, 1_000 + 30_000)).toBe(false);
});

test("cloud readings and missing data are never live", () => {
    expect(isLiveReading("cloud", 1_000, 1_001)).toBe(false);
    expect(isLiveReading(undefined, 1_000, 1_001)).toBe(false);
    expect(isLiveReading("grobro", 0, 1_001)).toBe(false); // never received
});

test("stream silence timeout allows for missed 15 s heartbeats", () => {
    expect(STREAM_SILENCE_TIMEOUT_MS).toBe(45_000);
});

test("watchdog fires after the timeout with no reset", async () => {
    let fired = 0;
    const dog = createWatchdog(40, () => fired++);
    dog.reset();
    await sleep(70);
    expect(fired).toBe(1);
    dog.stop();
});

test("resetting the watchdog postpones it; stop cancels it", async () => {
    let fired = 0;
    const dog = createWatchdog(50, () => fired++);
    dog.reset();
    await sleep(30);
    dog.reset();
    await sleep(30);
    expect(fired).toBe(0);
    dog.stop();
    await sleep(60);
    expect(fired).toBe(0);
});
