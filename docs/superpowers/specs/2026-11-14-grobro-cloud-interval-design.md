# Growatt cloud relay every 5 minutes — design

Date: 2026-11-14 · Status: approved by the owner in conversation

## Why

The dongle's data interval is `0`, so it reports about once a second, and GroBro relays
every report to the Growatt cloud: roughly 45 MB of upload a day from the shop. The local
dashboard needs every reading; the Growatt cloud only needs one every 5 minutes, as it had
before the interval change.

## Goals

- GroBro on the shop server keeps getting and decoding **every** reading at once. The local
  dashboard is unchanged.
- The Growatt cloud receives **at most one periodic reading per device every 5 minutes**.
- Everything else between the dongle and the cloud still passes **immediately**:
  - settings reads and writes, and their replies (function `0x05`/`0x06`), which the
    dashboard's charge-current and priority controls depend on;
  - holding-register reports (`0x03`) and logger config (`0x19`, e.g. `0x0119`, `0x0118`);
  - empty messages.

## Non-goals

- No change to what GroBro publishes locally, or to the dongle's own interval.
- No buffering or averaging: the cloud gets the latest report when the interval is due. Its
  energy totals stay correct because the inverter keeps cumulative counters.

## Approaches considered

1. **Patch GroBro's relay with an interval option** (chosen). About 10 lines in
   `grobro/grobro/client.py`, applied as a patch on top of the pinned `v2.7.5` image.
2. Set the dongle's interval back to 5 minutes. Rejected: the local dashboard would also drop
   to 5 minutes.
3. Write our own relay. Rejected: it duplicates GroBro's connection handling for a 10-line change.

## Design

- **New env `GROWATT_CLOUD_DATA_INTERVAL`** (seconds; default `0` means relay everything, as
  upstream does). Deployed with `300`.
- **Rule:** a message from the device whose function byte (header offset 7, unscrambled) is
  `0x04` (an input-register report: `0x0004` on SPF, `0x0104` on NEO) is relayed only if
  it's the device's first, or at least the interval has passed since the last one relayed for
  that device. Other messages are relayed as before. The local processing that follows the
  relay step is never skipped.
- **Clock:** `time.monotonic()`, tracked per device ID.
- **Packaging:**
  - `deploy/grobro/` in this repo holds the compose file (moved from the pasted Dokploy
    compose, no secrets or serials), a Dockerfile `FROM ghcr.io/robertzaage/grobro:v2.7.5`
    that applies `cloud-data-interval.patch`, and a `test` build stage that runs the patch's
    pytest tests;
  - the Dokploy `grobro` service switches from a pasted compose file to this GitHub branch,
    keeping the same project and volumes.

## Testing

pytest against GroBro's own client with its mock-MQTT fixtures:
- first reading relayed, a second within 5 min held back, relayed again after 5 min;
- `0x03`/`0x05`/`0x06`/`0x19` always relayed;
- interval `0` relays everything;
- devices are throttled independently;
- a held-back reading still reaches GroBro's local `on_input_register`.

On the server, the Growatt portal's update time moves about every 5 minutes while the
dashboard stays live, and settings reads still answer.
