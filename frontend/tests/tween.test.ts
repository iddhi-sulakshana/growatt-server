import { expect, test } from "bun:test";
import { nextTween, NUMBER_TWEEN_MS } from "../src/lib/tween";

test("a new value animates from the number on screen, not the previous target", () => {
    // Mid-animation from 100 to 200, the screen shows 150 when 300 arrives.
    expect(nextTween(150, 300)).toEqual({ from: 150, to: 300, durationMs: NUMBER_TWEEN_MS });
});

test("an animation finishes before the next live update (at most 2 per second)", () => {
    expect(NUMBER_TWEEN_MS).toBeLessThanOrEqual(500);
});
