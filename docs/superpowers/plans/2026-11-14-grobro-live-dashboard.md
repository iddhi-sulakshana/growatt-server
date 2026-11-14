# Live Dashboard Data from GroBro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Feed the dashboard's live fields from GroBro's local MQTT data and push each reading to the browser as it arrives, with automatic fallback to the Growatt cloud.

**Architecture:** The backend subscribes to GroBro's decoded state on the shop broker and maps it onto the existing `DeviceStatusData` shape. The result goes into an in-memory store that knows whether the local data is fresh. `/growatt/device-status` answers from that store. A new SSE endpoint, `/growatt/live`, pushes each store update. The frontend reads that stream with `fetch` and writes each event into React Query's `["device-status"]` cache, so existing components update unchanged. Polling resumes only while the stream is down.

**Tech Stack:** bun + Express 5 + MQTT.js (`mqtt`) on the backend. React 19 + TanStack Query + zustand on the frontend. nginx, Docker Compose, Dokploy.

**Spec:** `docs/superpowers/specs/2026-11-14-grobro-live-dashboard-design.md`

## Global Constraints

- Local data is "live" while the newest GroBro reading is **under 30 s** old (`LIVE_FRESHNESS_MS = 30_000`).
- Stream pushes are coalesced to **at most 2 per second** (`500` ms). Heartbeat comment every **15 s**. Cloud fallback poll every **5 s** while local data is stale.
- GroBro topic: `homeassistant/grobro/<datalogger-serial>/state`. The backend uses the read-only `reader` login.
- Env names: `GROBRO_MQTT_URL`, `GROBRO_MQTT_USERNAME`, `GROBRO_MQTT_PASSWORD`, `GROBRO_DEVICE`. **All optional**: if any is unset or empty, the feature is off and the app behaves as before.
- Response additions are additive only: `source: "grobro" | "cloud"`, `updatedAt` (ISO string). All other `DeviceStatusData` values stay strings.
- Broker credentials never reach the browser. Stream auth is the existing Bearer header.
- **The GitHub repo is public:** never commit the datalogger/inverter serials, LAN credentials or `grobro-test/`. Test fixtures use no serials.
- Packages via `bun` (`bun add`, `bun test`). Commit messages carry no AI co-author trailer (owner's rule).
- Work on branch `deploy/shadowserver`. Dokploy builds `compose.prod.yaml` from it. Deploy-on-push doesn't fire, so deploy manually.

## Review Focus

- **Empty or non-JSON MQTT payloads.** The dongle sends 0-byte messages. Expected: the message is ignored, nothing is logged at error level, and nothing crashes. Test lives in Task 3.
- **Broker unreachable when the backend starts.** Expected: the server still starts and `/device-status` serves the cloud with `source: "cloud"`. Test lives in Task 3 (subscriber off/failing → store stays not live) and Task 4 (service falls back).
- **Browser tab closed mid-stream.** Expected: the server clears its timers and unsubscribes from the store, with no leak and no writes after close. Test lives in Task 4.
- **Token expired or missing when the stream opens.** Expected: a 401 logs the user out exactly as `ApiClient` does, with no reconnect loop. Test lives in Task 5 (`shouldLogoutOnStatus(401) === true`).
- **Unknown `System_Status` label or a missing field** (firmware change). Expected: that field keeps the last cloud value. If there is no cloud value, `status` falls back to the raw label and numbers to `""`, never `"undefined"` or `"NaN"`. Test lives in Task 1.

---

### Task 1: GroBro → DeviceStatusData mapping

**Files:**
- Create: `backend/src/services/grobro/mapping.ts`
- Test: `backend/src/services/grobro/mapping.test.ts`

**Interfaces:**
- Consumes: `DeviceStatusData` from `backend/src/types/types.ts`
- Produces:
  ```ts
  export type GroBroState = Record<string, number | string | null | undefined>;
  export const SPF_SYSTEM_STATUS_CODES: Record<string, string>; // label -> code
  export function mapGroBroState(state: GroBroState, base: DeviceStatusData | null): DeviceStatusData;
  ```

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, test } from "bun:test";
import { mapGroBroState, SPF_SYSTEM_STATUS_CODES } from "./mapping";

const sample = { System_Status: "PV charge and Discharge", PV1_Voltage: 185.5, PV2_Voltage: 198.0,
  PV1_Power: 604.0, PV2_Power: 660.0, PV1_Current: 3.4, PV2_Current: 3.4, Output_Power: 1270.0,
  Output_VA: 1389.0, Battery_Voltage: 54.38, Battery_SOC: 75, Battery_Power: 43.0,
  AC_In_Voltage: 232.2, AC_In_Freq: 50.08, AC_Out_Voltage: 230.1, AC_Out_Freq: 50.13,
  Load_Percentage: 23.1, AC_Input_Power: 0.0, DC_Out_Voltage: 6553.5, Time_Total: "" };
const base = { invStatus: "-10", deviceType: "5", status: "5", vBat: "53.3" } as any;

test("maps every dashboard field from the GroBro sample", () => {
  const m = mapGroBroState(sample, base);
  expect(m).toMatchObject({ ppv1: "604", ppv2: "660", panelPower: "1264", vPv1: "185.5", vPv2: "198",
    iPv1: "3.4", iPv2: "3.4", iTotal: "6.8", loadPower: "1270", rateVA: "1389", loadPrecent: "23.1",
    batPower: "43", vBat: "54.38", capacity: "75", gridPower: "0", vAcInput: "232.2",
    fAcInput: "50.08", vAcOutput: "230.1", fAcOutput: "50.13", status: "12" });
});
test("keeps invStatus and deviceType from the cloud base", () => {
  expect(mapGroBroState(sample, base)).toMatchObject({ invStatus: "-10", deviceType: "5" });
});
test("negative battery power (charging) keeps its sign", () => {
  expect(mapGroBroState({ ...sample, Battery_Power: -346.0 }, base).batPower).toBe("-346");
});
test("sums are rounded to one decimal", () => {
  expect(mapGroBroState({ ...sample, PV1_Current: 0.1, PV2_Current: 0.2 }, base).iTotal).toBe("0.3");
});
test("unknown status label keeps the cloud status; without base it falls back to the label", () => {
  expect(mapGroBroState({ ...sample, System_Status: "New Mode" }, base).status).toBe("5");
  expect(mapGroBroState({ ...sample, System_Status: "New Mode" }, null).status).toBe("New Mode");
});
test("missing field keeps the base value, or empty string without base", () => {
  const { Battery_Voltage: _omit, ...rest } = sample;
  expect(mapGroBroState(rest, base).vBat).toBe("53.3");
  expect(mapGroBroState(rest, null).vBat).toBe("");
});
test("status table covers GroBro's SPF enum", () => {
  expect(SPF_SYSTEM_STATUS_CODES["Standby"]).toBe("0");
  expect(SPF_SYSTEM_STATUS_CODES["PV charge and Discharge"]).toBe("12");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd backend && bun test src/services/grobro/mapping.test.ts`
Expected: FAIL, cannot find module `./mapping`

- [ ] **Step 3: Implement `mapGroBroState` and `SPF_SYSTEM_STATUS_CODES` in `backend/src/services/grobro/mapping.ts`**

Take the mapping table from the spec. Format numbers with `String(Math.round(x * 100) / 100)`: this gives "198" for 198.0, keeps "54.38", and avoids float noise. Sums are rounded to 1 decimal. A field that's missing or non-finite falls back to `base?.[field] ?? ""`. The status table is GroBro's SPF enum, verbatim:
`0 Standby, 1 (No Use), 2 Discharge, 3 Fault, 4 Flash, 5 PV charge, 6 AC charge, 7 Combine charge, 8 Combine charge and Bypass, 9 PV charge and Bypass, 10 AC charge and Bypass, 11 Bypass, 12 PV charge and Discharge`.

- [ ] **Step 4: Run to verify it passes**

Run: `cd backend && bun test src/services/grobro/mapping.test.ts`
Expected: 7 pass, 0 fail

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/grobro/mapping.ts backend/src/services/grobro/mapping.test.ts
git commit -m "feat(backend): map GroBro SPF state onto the dashboard's device status"
```

---

### Task 2: Live status store and coalescer

**Files:**
- Create: `backend/src/services/grobro/live-store.ts`, `backend/src/utils/coalesce.ts`
- Test: `backend/src/services/grobro/live-store.test.ts`, `backend/src/utils/coalesce.test.ts`

**Interfaces:**
- Consumes: `mapGroBroState`, `GroBroState` (Task 1)
- Produces:
  ```ts
  export type LiveSource = "grobro" | "cloud";
  export type LiveDeviceStatus = DeviceStatusData & { source: LiveSource; updatedAt: string };
  export const LIVE_FRESHNESS_MS = 30_000;
  export class LiveStatusStore {
    updateFromGroBro(state: GroBroState, now?: number): void; // maps onto last cloud base, emits
    updateFromCloud(data: DeviceStatusData, now?: number): void; // saves base; emits only when not live
    isLive(now?: number): boolean;
    current(): LiveDeviceStatus | null;
    subscribe(listener: (s: LiveDeviceStatus) => void): () => void;
    subscriberCount(): number; // for leak tests
  }
  export const liveStatusStore: LiveStatusStore;
  export function createCoalescer<T>(intervalMs: number, flush: (value: T) => void): { push(value: T): void; stop(): void };
  ```

- [ ] **Step 1: Write the failing tests**

`live-store.test.ts` (pass explicit `now` values; no real timers):
- `updateFromGroBro(sample, 1000)` → `isLive(1000 + 29_999) === true`, `isLive(1000 + 30_000) === false`, `current().source === "grobro"`, `current().updatedAt === new Date(1000).toISOString()`.
- `updateFromCloud(cloud, 5000)` while live → no listener call, `current().source` stays `"grobro"`, but the next `updateFromGroBro` takes `invStatus` from that cloud data.
- `updateFromCloud(cloud, 100_000)` when stale → listener called once with `source: "cloud"`.
- The unsubscribe function returned by `subscribe` stops further calls, and `subscriberCount()` drops back to 0.

`coalesce.test.ts` (real timers, `intervalMs = 50`):
- The first `push(1)` flushes immediately.
- `push(2); push(3)` within 50 ms flushes only `3`, once, at about 50 ms.
- `stop()` cancels a pending trailing flush.

- [ ] **Step 2: Run to verify it fails**

Run: `cd backend && bun test src/services/grobro/live-store.test.ts src/utils/coalesce.test.ts`
Expected: FAIL, modules not found

- [ ] **Step 3: Implement `LiveStatusStore` (+ singleton `liveStatusStore`) and `createCoalescer`**

The coalescer flushes on the leading edge if `intervalMs` has passed since the last flush. Otherwise it keeps the latest value and schedules one trailing flush.

- [ ] **Step 4: Run to verify it passes**

Run: `cd backend && bun test src/services/grobro src/utils`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/grobro/live-store* backend/src/utils/coalesce*
git commit -m "feat(backend): keep the latest live status with freshness and coalesced updates"
```

---

### Task 3: Optional GroBro env + MQTT subscriber

**Files:**
- Modify: `backend/src/configs/ENV.ts` (add 4 optional vars; empty string counts as unset)
- Create: `backend/src/services/grobro/subscriber.ts`
- Modify: `backend/src/index.ts` (start the subscriber after `ENV.configEnvironment()`, before `app.listen`)
- Modify: `backend/package.json`, `backend/bun.lock` (`bun add mqtt@5`)
- Test: `backend/src/services/grobro/subscriber.test.ts`

**Interfaces:**
- Consumes: `LiveStatusStore`, `liveStatusStore` (Task 2)
- Produces:
  ```ts
  // ENV statics: GROBRO_MQTT_URL?, GROBRO_MQTT_USERNAME?, GROBRO_MQTT_PASSWORD?, GROBRO_DEVICE?: string
  export function grobroStateTopic(device: string): string; // `homeassistant/grobro/${device}/state`
  export function handleGroBroMessage(payload: Buffer | string, store: LiveStatusStore, now?: number): boolean;
  export function startGroBroSubscriber(store: LiveStatusStore): import("mqtt").MqttClient | null;
  ```

- [ ] **Step 1: Write the failing tests**

- `grobroStateTopic("ABC")` → `"homeassistant/grobro/ABC/state"`.
- `handleGroBroMessage(Buffer.alloc(0), store)` → `false`, `store.isLive() === false`.
- `handleGroBroMessage("not json", store)` → `false`. `handleGroBroMessage("[1,2]", store)` → `false` (not an object).
- `handleGroBroMessage(JSON.stringify(sample), store, 1000)` → `true`, `store.isLive(1000) === true`.
- With the four env vars unset, `startGroBroSubscriber(store)` → `null`.

- [ ] **Step 2: Run to verify it fails**

Run: `cd backend && bun test src/services/grobro/subscriber.test.ts`
Expected: FAIL, module not found

- [ ] **Step 3: Implement**

- Run `cd backend && bun add mqtt@5`.
- `startGroBroSubscriber`:
  - `mqtt.connect(ENV.GROBRO_MQTT_URL, { username, password, reconnectPeriod: 5000, clientId: "growatt-dashboard-<random>" })`;
  - subscribe to `grobroStateTopic(ENV.GROBRO_DEVICE)` on connect, and route messages through `handleGroBroMessage`;
  - log connect/close at info and errors at warn; it must never throw.
- `index.ts`: call `startGroBroSubscriber(liveStatusStore)` and log whether local data is enabled.

- [ ] **Step 4: Run to verify it passes**

Run: `cd backend && bun test`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add backend/src/configs/ENV.ts backend/src/services/grobro/subscriber* backend/src/index.ts backend/package.json backend/bun.lock
git commit -m "feat(backend): subscribe to GroBro's decoded state when GROBRO_* env is set"
```

---

### Task 4: Device status from the store + SSE `/growatt/live`

**Files:**
- Modify: `backend/src/routes/growatt/service.ts` (`getDeviceStatusDataService` → live-aware)
- Create: `backend/src/routes/growatt/live.ts`
- Modify: `backend/src/routes/growatt/controller.ts` (mount `router.get("/live", …)`)
- Test: `backend/src/routes/growatt/live.test.ts`

`LiveDeviceStatus` is imported from `services/grobro/live-store.ts`, and `types.ts` is unchanged.

**Interfaces:**
- Consumes: `liveStatusStore`, `LiveStatusStore`, `LiveDeviceStatus` (Task 2); `createCoalescer` (Task 2)
- Produces:
  ```ts
  // service.ts — same name, richer data; the controller is unchanged for /device-status
  export async function getDeviceStatusDataService(): Promise<DataResponse<LiveDeviceStatus>>;
  // live.ts
  export function createLiveStreamHandler(deps: {
    store: LiveStatusStore; refresh: () => Promise<unknown>;
    coalesceMs?: number; heartbeatMs?: number; fallbackPollMs?: number; // defaults 500 / 15000 / 5000
  }): import("express").RequestHandler;
  ```
  SSE wire format: `event: status\ndata: <LiveDeviceStatus JSON>\n\n`; heartbeat `: ping\n\n`.
  Headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`.

- [ ] **Step 1: Write the failing tests** (mount the handler on a bare Express app with `listen(0)`, read with `fetch`, and cancel the reader to close)

- Connecting with a store holding a GroBro state receives one `event: status` whose data has `source: "grobro"`, before any update.
- Three quick `store.updateFromGroBro` calls with `coalesceMs: 50` deliver at most 2 events within 60 ms, and the last carries the last value.
- With `heartbeatMs: 30`, a `: ping` line arrives.
- With a stale store and `fallbackPollMs: 30`, `refresh` is called at least once.
- After the client cancels, `refresh` is not called again and `store.subscriberCount() === 0`.
- Service: with a fresh store, `getDeviceStatusDataService()` returns `data.source === "grobro"` without calling the cloud.
  - Spy on the real instance: `spyOn(getGrowattInstance(), "getPlantDeviceStatusData")` (the exported `growatt` is a Proxy that binds instance methods) and assert 0 calls.
  - The live check comes before the plant/device check, so this works with no Growatt login.
- Service: with a stale store, it calls the cloud once, returns `source: "cloud"`, and `store.current().source === "cloud"`.
  - Also stub `getPlantId` → `"1"` and `getDevice` → `["SN", "storage"]` on the same instance.
  - The tests use the `liveStatusStore` singleton, so reset it between tests: give `LiveStatusStore` a `reset()` used only by tests, or have the service take the store as an optional parameter. Builder's choice.

- [ ] **Step 2: Run to verify it fails**

Run: `cd backend && bun test src/routes/growatt/live.test.ts`
Expected: FAIL, module not found

- [ ] **Step 3: Implement**

- **Service:** if `liveStatusStore.isLive()`, return `current()`. Otherwise fetch the cloud as today, call `liveStatusStore.updateFromCloud(data)`, and return `current()`.
- **Handler:**
  - set the headers, `flushHeaders()`, and write `current()` if present;
  - subscribe through a coalescer;
  - run a heartbeat interval, plus a fallback interval that calls `deps.refresh()` only when `!store.isLive()` and swallows its errors;
  - on `req.on("close")`, clear both intervals, stop the coalescer and unsubscribe.
- **Controller:** `router.get("/live", createLiveStreamHandler({ store: liveStatusStore, refresh: getDeviceStatusDataService }))`.

- [ ] **Step 4: Run to verify it passes**

Run: `cd backend && bun test`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/growatt backend/src/services/grobro/live-store.ts
git commit -m "feat(backend): serve live device status and push it over /growatt/live"
```

---

### Task 5: Frontend stream hook, polling fallback, Live/Cloud badge

**Files:**
- Create: `frontend/src/lib/sse.ts`
- Test: `frontend/tests/sse.test.ts`. This sits outside `src/` because `tsconfig.app.json` includes `src`, and a `bun:test` import there would fail `tsc -b`. Import with `../src/lib/sse`.
- Create: `frontend/src/lib/LiveConnectionStore.ts`
- Create: `frontend/src/service/live.ts`
- Create: `frontend/src/components/LiveSourceBadge.tsx`
- Modify: `frontend/src/types/growatt.ts` (`DeviceStatusData` gets `source?: "grobro" | "cloud"; updatedAt?: string`)
- Modify: `frontend/src/service/growatt.ts:17-24` (`refetchInterval` reads the connection store)
- Modify: `frontend/src/pages/Dashboard.tsx` (call `useLiveDeviceStatus()` and render `<LiveSourceBadge />`)

**Interfaces:**
- Consumes: the SSE wire format and `LiveDeviceStatus` shape (Task 4); `useAuthStore` (`token`, `logout`); `QueryClient` default export
- Produces:
  ```ts
  export type SseEvent = { event: string; data: string };
  export function parseSseChunk(buffer: string): { events: SseEvent[]; rest: string }; // lib/sse.ts
  export function shouldLogoutOnStatus(status: number): boolean;                        // lib/sse.ts, true only for 401
  export function nextBackoffMs(attempt: number): number;                               // lib/sse.ts: 1000, 2000, 5000, then 10000
  export const useLiveConnectionStore; // zustand: { connected: boolean; setConnected(v: boolean): void }
  export function useLiveDeviceStatus(): void;                                          // service/live.ts
  ```

- [ ] **Step 1: Write the failing tests** (`frontend/tests/sse.test.ts`, relative imports only, `bun:test`)

- `parseSseChunk("event: status\ndata: {\"a\":1}\n\n")` → one event `{ event: "status", data: "{\"a\":1}" }`, `rest: ""`.
- A chunk split mid-event (`"event: status\nda"`) → no events, `rest` keeps the text. Appending the remainder yields the event.
- `": ping\n\n"` → no events (comments ignored). A CRLF-separated event parses the same as LF.
- `shouldLogoutOnStatus(401) === true`, `shouldLogoutOnStatus(502) === false`.
- `nextBackoffMs(0..5)` → `[1000, 2000, 5000, 10000, 10000, 10000]`.

- [ ] **Step 2: Run to verify it fails**

Run: `cd frontend && bun test tests/sse.test.ts`
Expected: FAIL, module not found

- [ ] **Step 3: Implement**

- **`sse.ts`:** pure functions.
- **`useLiveDeviceStatus`:** in an effect keyed on `token`:
  - `fetch(`${import.meta.env.VITE_API_URL}/growatt/live`, { headers: { Authorization: `Bearer ${token}` }, signal })`;
  - a 401 calls `logout()` and stops; any other non-OK response or a stream end means reconnect after `nextBackoffMs(attempt)`;
  - set `connected` true on the first event and false on end/error;
  - each `status` event calls `queryClient.setQueryData(["device-status"], { status: 200, message: "live", data })`;
  - abort on unmount.
- **`getDeviceStatusService`:** `refetchInterval: connected ? false : 5000`.
- **`LiveSourceBadge`:** a small pill reading **Live** (green dot) when `connected && data.source === "grobro"`, otherwise **Cloud** (grey). Its placement fits the existing glass style; the builder decides where.

- [ ] **Step 4: Run tests and build**

Run: `cd frontend && bun test tests/sse.test.ts && VITE_API_URL=/api/v1 bun run build`
Expected: tests pass; `✓ built` with no TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src frontend/tests
git commit -m "feat(frontend): stream live device status and fall back to polling"
```

---

### Task 6: nginx stream route, compose env, deploy and verify

**Files:**
- Modify: `frontend/nginx.conf` (add before `location /api/`)
- Modify: `compose.prod.yaml` (backend env)

**Interfaces:**
- Consumes: everything above. The Dokploy compose `dashboard` (`composeId 6tUiiTQeAd3LykBWSZmIx`) and its env. The reader password is in the git-ignored `grobro-test/.env.shadowserver`.

- [ ] **Step 1: Add the nginx stream location**

`location = /api/v1/growatt/live`, with the same proxy lines as `/api/`, plus `proxy_buffering off; proxy_cache off; proxy_read_timeout 3600s; proxy_set_header Connection "";`.

- [ ] **Step 2: Map the env in `compose.prod.yaml`**

Backend `environment:` gains:
```yaml
GROBRO_MQTT_URL: ${GROBRO_MQTT_URL:-}
GROBRO_MQTT_USERNAME: ${GROBRO_MQTT_USERNAME:-}
GROBRO_MQTT_PASSWORD: ${GROBRO_MQTT_PASSWORD:-}
GROBRO_DEVICE: ${GROBRO_DEVICE:-}
```

- [ ] **Step 3: Local stack smoke test**

Run the earlier local check (`docker compose -p growatt-verify -f compose.prod.yaml up -d --build`, with a temporary `dokploy-network`) with `GROBRO_MQTT_URL=mqtt://192.168.1.157:1883`, the `reader` login and the device serial exported in the shell (not in any file).

Then: `curl -N -H "Authorization: Bearer $T" http://127.0.0.1:8082/api/v1/growatt/live`.
Expected: `event: status` lines with `"source":"grobro"` arriving about every 0.5–1 s.

Tear it down afterwards and remove the temporary network.

- [ ] **Step 4: Commit and push**

```bash
git add frontend/nginx.conf compose.prod.yaml
git commit -m "build(deploy): stream route in nginx and GroBro env for the backend"
git push
```

- [ ] **Step 5: Set the Dokploy env and deploy**

- `compose-update` env for `dashboard`: the existing lines plus `GROBRO_MQTT_URL=mqtt://192.168.1.157:1883`, `GROBRO_MQTT_USERNAME=reader`, `GROBRO_MQTT_PASSWORD=<from .env.shadowserver>`, `GROBRO_DEVICE=<datalogger serial>`.
- Then `compose-deploy` and watch the newest `/etc/dokploy/logs/growatt-dashboard-7slovl/*.log` until `Docker Compose Deployed: ✅`.
- If the backend can't reach `192.168.1.157:1883` from its container (hairpin NAT), attach `mosquitto` and `backend` to `dokploy-network` and use `mqtt://<grobro mosquitto service name>:1883` instead.

- [ ] **Step 6: Verify on the shop server**

- Backend log shows the GroBro subscriber connected.
- `curl -N` against `http://growatt.lan/api/v1/growatt/live` (Bearer) streams `"source":"grobro"`.
- In the browser, `http://growatt.lan` shows the **Live** badge and the power flow changes within about a second of the GroBro stream.
- Stop the `grobro` compose in Dokploy: within about 30 s the badge reads **Cloud** and the numbers keep updating every 5 s.
- Start it again: back to **Live**.
