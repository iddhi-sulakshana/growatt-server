import { beforeEach, expect, test } from "bun:test";
import { ENV } from "@/configs";
import { LiveStatusStore } from "./live-store";
import { grobroStateTopic, handleGroBroMessage, startGroBroSubscriber } from "./subscriber";

const sample = { System_Status: "PV charge", PV1_Power: 500.0, PV2_Power: 480.0, Battery_SOC: 80 };

let store: LiveStatusStore;
beforeEach(() => {
    store = new LiveStatusStore();
});

test("state topic for a datalogger serial", () => {
    expect(grobroStateTopic("ABC")).toBe("homeassistant/grobro/ABC/state");
});

test("empty payload (the dongle sends 0-byte messages) is ignored", () => {
    expect(handleGroBroMessage(Buffer.alloc(0), store)).toBe(false);
    expect(store.isLive()).toBe(false);
});

test("non-JSON and non-object payloads are ignored", () => {
    expect(handleGroBroMessage("not json", store)).toBe(false);
    expect(handleGroBroMessage("[1,2]", store)).toBe(false);
    expect(handleGroBroMessage("null", store)).toBe(false);
    expect(store.current()).toBeNull();
});

test("a valid state makes the store live", () => {
    expect(handleGroBroMessage(JSON.stringify(sample), store, 1000)).toBe(true);
    expect(store.isLive(1000)).toBe(true);
    expect(store.current()?.panelPower).toBe("980");
});

test("subscriber is off when GROBRO_* env is unset or empty", () => {
    ENV.GROBRO_MQTT_URL = undefined;
    ENV.GROBRO_DEVICE = undefined;
    expect(startGroBroSubscriber(store)).toBeNull();
    ENV.GROBRO_MQTT_URL = "";
    ENV.GROBRO_DEVICE = "";
    expect(startGroBroSubscriber(store)).toBeNull();
});
