import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { LiveStatusStore, liveStatusStore } from "@/services/grobro/live-store";
import { getGrowattInstance } from "@/services/growatt-instance";
import { createLiveStreamHandler } from "./live";
import { getDeviceStatusDataService } from "./service";

const sample = (pv1: number) => ({ System_Status: "PV charge", PV1_Power: pv1, PV2_Power: 0, Battery_SOC: 80 });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let server: Server | null = null;

async function openStream(handler: express.RequestHandler) {
    const app = express();
    app.get("/live", handler);
    server = app.listen(0);
    await new Promise((resolve) => server!.once("listening", resolve));
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}/live`);
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";
    const readFor = async (ms: number) => {
        const deadline = Date.now() + ms;
        while (Date.now() < deadline) {
            const chunk = await Promise.race([
                reader.read(),
                sleep(Math.max(1, deadline - Date.now())).then(() => null),
            ]);
            if (!chunk || chunk.done) continue;
            text += decoder.decode(chunk.value, { stream: true });
        }
        return text;
    };
    return { res, reader, readFor };
}

const statusEvents = (text: string) =>
    text
        .split("\n\n")
        .filter((block) => block.startsWith("event: status"))
        .map((block) => JSON.parse(block.split("\ndata: ")[1]!));

afterEach(() => {
    server?.close();
    server = null;
});

test("sends the current status immediately with SSE headers", async () => {
    const store = new LiveStatusStore();
    store.updateFromGroBro(sample(500));
    const { res, reader, readFor } = await openStream(
        createLiveStreamHandler({ store, refresh: async () => {} })
    );
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    expect(res.headers.get("x-accel-buffering")).toBe("no");
    const events = statusEvents(await readFor(60));
    expect(events).toHaveLength(1);
    expect(events[0].source).toBe("grobro");
    expect(events[0].panelPower).toBe("500");
    await reader.cancel();
});

test("rapid updates are coalesced and the last value wins", async () => {
    const store = new LiveStatusStore();
    store.updateFromGroBro(sample(100));
    const { reader, readFor } = await openStream(
        createLiveStreamHandler({ store, refresh: async () => {}, coalesceMs: 50 })
    );
    await readFor(30); // initial event
    store.updateFromGroBro(sample(200));
    store.updateFromGroBro(sample(300));
    store.updateFromGroBro(sample(400));
    const events = statusEvents(await readFor(80));
    const updates = events.slice(1);
    expect(updates.length).toBeLessThanOrEqual(2);
    expect(updates.at(-1).panelPower).toBe("400");
    await reader.cancel();
});

test("sends heartbeat comments", async () => {
    const store = new LiveStatusStore();
    const { reader, readFor } = await openStream(
        createLiveStreamHandler({ store, refresh: async () => {}, heartbeatMs: 30 })
    );
    expect(await readFor(80)).toContain(": ping\n\n");
    await reader.cancel();
});

test("polls the cloud while local data is stale", async () => {
    const store = new LiveStatusStore();
    let calls = 0;
    const { reader, readFor } = await openStream(
        createLiveStreamHandler({ store, refresh: async () => void calls++, fallbackPollMs: 30 })
    );
    await readFor(100);
    expect(calls).toBeGreaterThanOrEqual(1);
    await reader.cancel();
});

test("a closed client stops polling and unsubscribes", async () => {
    const store = new LiveStatusStore();
    let calls = 0;
    const { reader, readFor } = await openStream(
        createLiveStreamHandler({ store, refresh: async () => void calls++, fallbackPollMs: 30 })
    );
    await readFor(50);
    expect(store.subscriberCount()).toBe(1);
    await reader.cancel();
    await sleep(60);
    const after = calls;
    await sleep(100);
    expect(calls).toBe(after);
    expect(store.subscriberCount()).toBe(0);
});

test("slow cloud refreshes never overlap, even with several clients", async () => {
    const store = new LiveStatusStore();
    let inFlight = 0;
    let maxInFlight = 0;
    let calls = 0;
    const handler = createLiveStreamHandler({
        store,
        fallbackPollMs: 20,
        refresh: async () => {
            calls++;
            inFlight++;
            maxInFlight = Math.max(maxInFlight, inFlight);
            await sleep(100);
            inFlight--;
        },
    });
    const app = express();
    app.get("/live", handler);
    server = app.listen(0);
    await new Promise((resolve) => server!.once("listening", resolve));
    const { port } = server.address() as AddressInfo;
    const a = await fetch(`http://127.0.0.1:${port}/live`);
    const b = await fetch(`http://127.0.0.1:${port}/live`);
    await sleep(260);
    expect(maxInFlight).toBe(1);
    expect(calls).toBeLessThanOrEqual(3); // one shared poller, not one per client
    await a.body!.cancel();
    await b.body!.cancel();
});

beforeEach(() => liveStatusStore.reset());

test("device-status answers from fresh GroBro data without calling the cloud", async () => {
    const cloud = spyOn(getGrowattInstance(), "getPlantDeviceStatusData");
    liveStatusStore.updateFromGroBro(sample(700));
    const response = await getDeviceStatusDataService();
    expect(response.data.source).toBe("grobro");
    expect(response.data.panelPower).toBe("700");
    expect(cloud).toHaveBeenCalledTimes(0);
    cloud.mockRestore();
});

test("device-status falls back to the cloud when local data is stale", async () => {
    const instance = getGrowattInstance();
    const plant = spyOn(instance, "getPlantId").mockReturnValue("1");
    const device = spyOn(instance, "getDevice").mockReturnValue(["SN", "storage"] as any);
    const cloud = spyOn(instance, "getPlantDeviceStatusData").mockResolvedValue({
        panelPower: "999",
        invStatus: "-10",
    } as any);
    const response = await getDeviceStatusDataService();
    expect(cloud).toHaveBeenCalledTimes(1);
    expect(response.data.source).toBe("cloud");
    expect(response.data.panelPower).toBe("999");
    expect(liveStatusStore.current()?.source).toBe("cloud");
    plant.mockRestore();
    device.mockRestore();
    cloud.mockRestore();
});
