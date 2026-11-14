/**
 * Number animations must finish before the next live update arrives (the backend sends
 * at most 2 per second), or they pile up and jump.
 */
export const NUMBER_TWEEN_MS = 400;

/** The animation for a new value: from whatever is on screen now, to the new value. */
export function nextTween(
    displayed: number,
    target: number
): { from: number; to: number; durationMs: number } {
    return { from: displayed, to: target, durationMs: NUMBER_TWEEN_MS };
}
