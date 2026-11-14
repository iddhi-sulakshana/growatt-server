# Live dashboard data from GroBro — design

Date: 2026-11-14 · Status: proposed

## Why

The dashboard's live numbers (power flow, live metrics, hover cards) come from the Growatt
cloud. The frontend polls `/growatt/device-status` every 5 s, and the cloud's data itself lags
(in testing it returned identical values 4 s apart while the inverter had changed).
The Shine dongle now sends its data to the local broker on the shop server about once a
second, and GroBro decodes it there. The owner wants the dashboard fed from that local data
and **updated the moment a reading arrives**, not on a timer.

## Goals

- Live fields update in the browser within about a second of the dongle's reading.
- The frontend's data shape (`DeviceStatusData`) stays the same, so the five components
  that read it don't change.
- If local data stops (broker down, dongle back on the cloud), the dashboard keeps working
  from the cloud automatically.

## Non-goals

- Daily/total energy, history charts and inverter settings stay on the Growatt cloud. GroBro
  doesn't decode the load-energy counters, and settings must go through Growatt; GroBro's
  relay keeps that path working.
- No local storage of readings (Postgres stays unused).

## Anti-goals

- The dashboard must not break or go blank when the broker is unreachable.
- Broker credentials must never reach the browser.

## Constraints

- Shop LAN only, served at `http://growatt.lan` by nginx (`web`) in front of the bun backend.
- The broker (Dokploy compose `grobro`) and the dashboard (compose `dashboard`) are separate
  projects on the same host. The backend reaches Mosquitto at `mqtt://192.168.1.157:1883`
  with the read-only `reader` login (it may read `homeassistant/#` only).
- GroBro publishes the full decoded state as JSON on `homeassistant/grobro/<datalogger-serial>/state`,
  roughly 1–3 times a second.
- API auth is a Bearer header. `EventSource` cannot send headers, so the browser reads the
  stream with `fetch` and a streaming body reader.

## Approaches considered

1. **Backend caches GroBro state and the frontend keeps polling (faster).** Smallest change,
   but updates still arrive on a timer.
2. **Backend caches GroBro state and pushes each update to the browser over Server-Sent
   Events.** Updates arrive as they happen. **Chosen by the owner.**
3. **Browser subscribes to MQTT over WebSockets.** Rejected: it exposes broker credentials to
   the browser and needs an extra broker listener.

## Design

### Backend

- **GroBro subscriber** (new service, MQTT.js `mqtt` package). It connects with
  `GROBRO_MQTT_URL`, `GROBRO_MQTT_USERNAME`, `GROBRO_MQTT_PASSWORD` and subscribes to the state
  topic for `GROBRO_DEVICE` (the datalogger serial). If those env vars are unset, the feature is
  off and the app behaves as it does today.
- **Mapping** GroBro JSON → `DeviceStatusData` (all values as strings, as the cloud returns them):

  | Dashboard field | GroBro field |
  |---|---|
  | `ppv1` / `ppv2` / `panelPower` | `PV1_Power` / `PV2_Power` / their sum |
  | `vPv1` / `vPv2`, `iPv1` / `iPv2` | `PV1_Voltage` / `PV2_Voltage`, `PV1_Current` / `PV2_Current` |
  | `iTotal` | `PV1_Current + PV2_Current` |
  | `loadPower`, `rateVA`, `loadPrecent` | `Output_Power`, `Output_VA`, `Load_Percentage` |
  | `batPower` (+ discharging, − charging) | `Battery_Power` (same sign) |
  | `vBat`, `capacity` | `Battery_Voltage`, `Battery_SOC` |
  | `gridPower`, `vAcInput`, `fAcInput` | `AC_Input_Power`, `AC_In_Voltage`, `AC_In_Freq` |
  | `vAcOutput`, `fAcOutput` | `AC_Out_Voltage`, `AC_Out_Freq` |
  | `status` | `System_Status` label mapped back to its code (GroBro's SPF enum, e.g. "PV charge and Discharge" → `12`) |
  | `invStatus`, `deviceType` | not in GroBro: kept from the last cloud snapshot |

- **Freshness:** local state counts as live if it's under 30 s old. The response gains two
  additive fields, `source: "grobro" | "cloud"` and `updatedAt`.
- **`GET /growatt/device-status`** (existing) returns the live state when it's fresh, otherwise
  the cloud value as today.
- **`GET /growatt/live`** (new, authorized, `text/event-stream`):
  - sends the current state immediately, then every update, coalesced to at most 2 per second;
  - sends a heartbeat comment every 15 s and `X-Accel-Buffering: no`;
  - while local data is stale and clients are connected, polls the cloud every 5 s and pushes
    that instead, so the client has a single path.

### Frontend

- A `useLiveDeviceStatus` hook, mounted once on the dashboard. It opens the stream with the
  Bearer token and writes each event into React Query's `["device-status"]` cache
  (`setQueryData`), so every existing consumer updates with no change.
- The 5 s polling stays as the fallback: it's turned off while the stream is connected and back
  on while it's reconnecting (with backoff).
- A small "Live" / "Cloud" indicator from `source` (my call: it shows at a glance where the
  numbers come from, and it's easy to drop).

### nginx and deployment

- A `location = /api/v1/growatt/live` block with `proxy_buffering off`, a long `proxy_read_timeout`,
  and HTTP/1.1 keep-alive.
- `compose.prod.yaml` maps the four `GROBRO_*` env vars into the backend; their values go in
  Dokploy's env for the `dashboard` service.

## Testing

- Unit tests for the mapping and status-code lookup, run against a captured GroBro payload (bun test).
- Manual on the shop server:
  - the dashboard updates about once a second and the indicator shows **Live**;
  - stopping the `grobro` compose switches to **Cloud** within about 30 s;
  - starting it again returns to **Live**.

## Left to the builder

File layout, the exact coalescing and backoff values, and the indicator's placement and styling.
