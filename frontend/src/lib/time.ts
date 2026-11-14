const pad = (value: number, length = 2) => String(value).padStart(length, "0");

/** Local "HH:mm:ss.SSS" for the time a reading was received, or null if unknown. */
export function formatUpdatedAt(iso: string | undefined): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(
        date.getMilliseconds(),
        3
    )}`;
}
