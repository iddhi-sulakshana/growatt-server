import { beforeEach, expect, test } from "bun:test";
import { LIVE_FRESHNESS_MS, LiveStatusStore, type LiveDeviceStatus } from "./live-store";
import type { DeviceStatusData } from "@/types/types";

const sample = {
    System_Status: "PV charge and Discharge",
    PV1_Power: 604.0,
    PV2_Power: 660.0,
    Battery_SOC: 75,
};
const cloud = {
    invStatus: "-10",
    deviceType: "5",
    status: "12",
    capacity: "74",
} as DeviceStatusData;

let store: LiveStatusStore;
let received: LiveDeviceStatus[];

beforeEach(() => {
    store = new LiveStatusStore();
    received = [];
    store.subscribe((s) => received.push(s));
});

test("GroBro data is live for 30 s after it arrives", () => {
    store.updateFromGroBro(sample, 1000);
    expect(LIVE_FRESHNESS_MS).toBe(30_000);
    expect(store.isLive(1000 + 29_999)).toBe(true);
    expect(store.isLive(1000 + 30_000)).toBe(false);
    expect(store.current()?.source).toBe("grobro");
    expect(store.current()?.updatedAt).toBe(new Date(1000).toISOString());
    expect(received).toHaveLength(1);
});

test("cloud data while live is kept as the base but not emitted", () => {
    store.updateFromGroBro(sample, 1000);
    store.updateFromCloud(cloud, 5000);
    expect(received).toHaveLength(1);
    expect(store.current()?.source).toBe("grobro");
    store.updateFromGroBro(sample, 6000);
    expect(store.current()?.invStatus).toBe("-10");
});

test("cloud data when stale becomes current and is emitted", () => {
    store.updateFromGroBro(sample, 1000);
    store.updateFromCloud(cloud, 100_000);
    expect(received).toHaveLength(2);
    expect(received[1]?.source).toBe("cloud");
    expect(received[1]?.capacity).toBe("74");
    expect(received[1]?.updatedAt).toBe(new Date(100_000).toISOString());
});

test("unsubscribe stops further calls", () => {
    const calls: LiveDeviceStatus[] = [];
    const unsubscribe = store.subscribe((s) => calls.push(s));
    expect(store.subscriberCount()).toBe(2);
    unsubscribe();
    store.updateFromGroBro(sample, 1000);
    expect(calls).toHaveLength(0);
    expect(store.subscriberCount()).toBe(1);
});

test("reset clears state and listeners", () => {
    store.updateFromGroBro(sample, 1000);
    store.reset();
    expect(store.current()).toBeNull();
    expect(store.isLive(1000)).toBe(false);
    expect(store.subscriberCount()).toBe(0);
});
