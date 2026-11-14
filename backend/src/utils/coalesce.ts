/**
 * Rate-limits a stream of values: the first value flushes at once, and values
 * arriving within `intervalMs` of the last flush collapse into one trailing flush
 * of the latest value.
 */
export function createCoalescer<T>(
    intervalMs: number,
    flush: (value: T) => void
): { push(value: T): void; stop(): void } {
    let lastFlushAt = -Infinity;
    let pending: { value: T } | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const flushNow = (value: T) => {
        lastFlushAt = Date.now();
        flush(value);
    };

    return {
        push(value: T) {
            const elapsed = Date.now() - lastFlushAt;
            if (elapsed >= intervalMs && !timer) {
                flushNow(value);
                return;
            }
            pending = { value };
            if (!timer) {
                timer = setTimeout(() => {
                    timer = null;
                    if (pending) {
                        const { value: latest } = pending;
                        pending = null;
                        flushNow(latest);
                    }
                }, Math.max(0, intervalMs - elapsed));
            }
        },
        stop() {
            if (timer) clearTimeout(timer);
            timer = null;
            pending = null;
        },
    };
}
