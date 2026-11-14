import { expect, test } from "bun:test";
import { createCoalescer } from "./coalesce";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("first push flushes immediately", () => {
    const flushed: number[] = [];
    const c = createCoalescer<number>(50, (v) => flushed.push(v));
    c.push(1);
    expect(flushed).toEqual([1]);
    c.stop();
});

test("pushes within the interval flush only the latest, once, at the interval", async () => {
    const flushed: number[] = [];
    const c = createCoalescer<number>(50, (v) => flushed.push(v));
    c.push(1);
    c.push(2);
    c.push(3);
    expect(flushed).toEqual([1]);
    await sleep(80);
    expect(flushed).toEqual([1, 3]);
    c.stop();
});

test("stop cancels a pending trailing flush", async () => {
    const flushed: number[] = [];
    const c = createCoalescer<number>(50, (v) => flushed.push(v));
    c.push(1);
    c.push(2);
    c.stop();
    await sleep(80);
    expect(flushed).toEqual([1]);
});
