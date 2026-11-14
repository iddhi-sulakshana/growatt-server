import type { DeviceStatusData } from "@/types/types";
import { mapGroBroState, type GroBroState } from "./mapping";

export type LiveSource = "grobro" | "cloud";
export type LiveDeviceStatus = DeviceStatusData & { source: LiveSource; updatedAt: string };

/** Local data counts as live while the newest GroBro reading is younger than this. */
export const LIVE_FRESHNESS_MS = 30_000;

type Listener = (status: LiveDeviceStatus) => void;

/**
 * Latest device status for the dashboard. GroBro readings win while they're fresh;
 * otherwise the latest cloud snapshot is current. Cloud data is always kept as the
 * base for fields GroBro doesn't provide (invStatus, deviceType).
 */
export class LiveStatusStore {
    private cloudBase: DeviceStatusData | null = null;
    private latest: LiveDeviceStatus | null = null;
    private lastGroBroAt: number | null = null;
    private listeners = new Set<Listener>();

    updateFromGroBro(state: GroBroState, now: number = Date.now()): void {
        this.lastGroBroAt = now;
        this.setCurrent({
            ...mapGroBroState(state, this.cloudBase),
            source: "grobro",
            updatedAt: new Date(now).toISOString(),
        });
    }

    updateFromCloud(data: DeviceStatusData, now: number = Date.now()): void {
        this.cloudBase = data;
        if (this.isLive(now)) return;
        this.setCurrent({ ...data, source: "cloud", updatedAt: new Date(now).toISOString() });
    }

    isLive(now: number = Date.now()): boolean {
        return this.lastGroBroAt !== null && now - this.lastGroBroAt < LIVE_FRESHNESS_MS;
    }

    current(): LiveDeviceStatus | null {
        return this.latest;
    }

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    subscriberCount(): number {
        return this.listeners.size;
    }

    /** Test helper: forget all state and listeners. */
    reset(): void {
        this.cloudBase = null;
        this.latest = null;
        this.lastGroBroAt = null;
        this.listeners.clear();
    }

    private setCurrent(status: LiveDeviceStatus): void {
        this.latest = status;
        for (const listener of this.listeners) listener(status);
    }
}

export const liveStatusStore = new LiveStatusStore();
