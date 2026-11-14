import mqtt, { type MqttClient } from "mqtt";
import winston from "winston";
import { ENV } from "@/configs";
import type { LiveStatusStore } from "./live-store";
import type { GroBroState } from "./mapping";

/** GroBro's decoded-state topic for one datalogger serial. */
export function grobroStateTopic(device: string): string {
    return `homeassistant/grobro/${device}/state`;
}

/**
 * Applies one GroBro state message to the store. Empty payloads (the dongle sends
 * them), invalid JSON and non-object JSON are ignored. Returns whether it was applied.
 */
export function handleGroBroMessage(
    payload: Buffer | string,
    store: LiveStatusStore,
    now: number = Date.now()
): boolean {
    const text = typeof payload === "string" ? payload : payload.toString("utf8");
    if (text.trim() === "") return false;

    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        return false;
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return false;

    store.updateFromGroBro(parsed as GroBroState, now);
    return true;
}

/**
 * Connects to the broker and feeds GroBro's state into the store. Returns null (feature
 * off) unless the URL and device serial are configured. Never throws; MQTT.js reconnects.
 */
export function startGroBroSubscriber(store: LiveStatusStore): MqttClient | null {
    const url = ENV.GROBRO_MQTT_URL;
    const device = ENV.GROBRO_DEVICE;
    if (!url || !device) return null;

    const topic = grobroStateTopic(device);
    try {
        const client = mqtt.connect(url, {
            username: ENV.GROBRO_MQTT_USERNAME,
            password: ENV.GROBRO_MQTT_PASSWORD,
            reconnectPeriod: 5000,
            clientId: `growatt-dashboard-${Math.random().toString(16).slice(2, 10)}`,
        });

        client.on("connect", () => {
            winston.info(`GroBro: connected to ${url}, subscribing to ${topic}`);
            client.subscribe(topic, (error) => {
                if (error) winston.warn(`GroBro: subscribe failed: ${error.message}`);
            });
        });
        client.on("message", (_topic, payload) => {
            handleGroBroMessage(payload, store);
        });
        client.on("close", () => winston.info("GroBro: connection closed, will retry"));
        client.on("error", (error) => winston.warn(`GroBro: ${error.message}`));

        return client;
    } catch (error: any) {
        winston.warn(`GroBro: could not start subscriber: ${error?.message ?? error}`);
        return null;
    }
}
