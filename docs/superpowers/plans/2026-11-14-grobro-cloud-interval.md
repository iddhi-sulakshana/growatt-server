# Growatt Cloud Relay Interval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relay periodic readings to the Growatt cloud at most every 5 minutes while GroBro keeps every reading locally.

**Architecture:** A patch to GroBro v2.7.5's relay step adds `GROWATT_CLOUD_DATA_INTERVAL`. Messages with function byte `0x04` are rate-limited per device before `forward_client.publish`, and everything else is unchanged. The patched image is built from `deploy/grobro/` in this repo; Dokploy's `grobro` service builds it from GitHub.

**Tech Stack:** Python 3.11 (GroBro), pytest, Docker multi-stage build, Dokploy.

**Spec:** `docs/superpowers/specs/2026-11-14-grobro-cloud-interval-design.md`

## Global Constraints

- `GROWATT_CLOUD_DATA_INTERVAL` is in seconds. Default `0` relays everything, as upstream does. Deployed value `300`.
- Throttle only on function byte (offset 7) `== 0x04`. Never skip GroBro's local processing.
- Base image pinned: `ghcr.io/robertzaage/grobro:v2.7.5`. The patch must apply cleanly to that tag, and the build fails if it doesn't.
- Public repo: no serials, passwords or LAN secrets in `deploy/grobro/`. Values live in Dokploy env.
- No AI co-author trailer in commits. Branch `deploy/shadowserver`. Deploy manually (deploy-on-push doesn't fire).

## Review Focus

- **Empty payloads** (the dongle sends them): relayed unchanged and never crash the throttle. Test in Task 1.
- **Clock going backwards** isn't possible with `time.monotonic()`; a first reading after a long silence is relayed. Test in Task 1 (relayed again after the interval).
- **Settings round-trips while readings are held back:** `0x05`/`0x06` must pass within the interval. Test in Task 1.

---

### Task 1: Relay-interval patch with tests

**Files:**
- Create: `deploy/grobro/Dockerfile` (stages: `patched`, `test`, final)
- Create: `deploy/grobro/cloud-data-interval.patch` (unified diff against v2.7.5 `grobro/grobro/client.py`, made with `diff -u` from `/Volumes/storage/tmp/grobro-src` at tag `v2.7.5`)
- Create: `deploy/grobro/tests/test_cloud_interval.py`
- Create: `deploy/grobro/tests/data/NeoInputRegister.bin` (copied from GroBro's MIT-licensed tests; function `0x04`, msg type `0x0104`)

**Interfaces:**
- Produces, in patched `grobro.grobro.client`:
  - module constants `GROWATT_CLOUD_DATA_INTERVAL: int` and `CLOUD_THROTTLED_FUNCTIONS = {0x04}`;
  - `Client._cloud_data_sent_at: dict[str, float]`;
  - private `Client.__cloud_data_due(device_id: str, payload: bytes) -> bool`.

- [ ] **Step 1: Write the failing tests** (pytest; fixtures as in GroBro's `tests/test_grobro_client.py`: patch `grobro.grobro.client.mqtt.Client`, `Client(MQTTConfig(host="localhost", port=1883), MQTTConfig(host="forward.com", port=7006))`, patch `_Client__connect_to_growatt_server` to return a `MagicMock` forward client. Patch `GROWATT_CLOUD="true"`, `GROWATT_CLOUD_ENABLED=True`, `GROWATT_CLOUD_DATA_INTERVAL=300`, and `grobro.grobro.client.time.monotonic`.)
  - `test_first_reading_relayed_then_held_then_relayed_after_interval`: header `...\x00\x04` messages at t=0, 10, 299, 300 → `fc.publish` called 2 times.
  - `test_non_reading_messages_always_relayed`: function bytes `0x03, 0x05, 0x06, 0x19` sent twice within 10 s → 8 publishes.
  - `test_interval_zero_relays_every_reading`: interval `0`, 3 readings at t=0, 1, 2 → 3 publishes.
  - `test_devices_throttled_independently`: device A at t=0 and t=10, device B at t=10 → 2 publishes (A once, B once).
  - `test_empty_payload_relayed`: `b""` → 1 publish, no exception.
  - `test_held_back_reading_still_processed_locally`: `NeoInputRegister.bin` on `c/33/QMN000ABC1D2E3FG` at t=0 and t=10 → `client.on_input_register.call_count == 2`, `fc.publish.call_count == 1`.

- [ ] **Step 2: Run to verify it fails**

Run: `docker build --target test deploy/grobro` (with an empty `cloud-data-interval.patch`)
Expected: the build fails in the test stage, because the throttle tests fail (`GROWATT_CLOUD_DATA_INTERVAL` doesn't exist / publish counts are wrong).

- [ ] **Step 3: Write the patch**

Edit a copy of v2.7.5 `client.py`:
- add `import time`;
- add `GROWATT_CLOUD_DATA_INTERVAL = int(os.getenv("GROWATT_CLOUD_DATA_INTERVAL", "0"))` and `CLOUD_THROTTLED_FUNCTIONS = {0x04}` beside the other `GROWATT_CLOUD_*` constants;
- `self._cloud_data_sent_at = {}` in `__init__`;
- `__cloud_data_due` reads `payload[7]` when `len(payload) >= 8` (the header isn't scrambled);
- in `__on_message`, wrap the existing `forward_client = …; forward_client.publish(…)` in `if self.__cloud_data_due(device_id, msg.payload):`, else `LOG.debug("Holding back reading for %s from Growatt Cloud", device_id)`.

Then `diff -u a/grobro/grobro/client.py b/grobro/grobro/client.py > deploy/grobro/cloud-data-interval.patch`.

- [ ] **Step 4: Run to verify it passes**

Run: `docker build --target test deploy/grobro`
Expected: the build succeeds; the pytest summary shows `6 passed`.

- [ ] **Step 5: Commit**

```bash
git add deploy/grobro
git commit -m "feat(grobro): relay readings to the Growatt cloud at most every GROWATT_CLOUD_DATA_INTERVAL seconds"
```

### Task 2: Compose in the repo, Dokploy from GitHub, verify

**Files:**
- Create: `deploy/grobro/compose.yaml`. This is the current `grobro-test/dokploy-compose.yml` content, except that the `grobro` service changes from `image: …:v2.7.5` to `build: { context: ., dockerfile: Dockerfile }` and gains `GROWATT_CLOUD_DATA_INTERVAL: ${GROWATT_CLOUD_DATA_INTERVAL:-300}`.

- [ ] **Step 1: Validate the compose file**

Run: `BROKER_IP=192.168.1.157 DONGLE_SERIALS=X GROBRO_MQTT_PASS=x READER_MQTT_PASS=x docker compose -f deploy/grobro/compose.yaml config --quiet && docker build deploy/grobro`
Expected: no output from `config`; the final image builds.

- [ ] **Step 2: Commit and push**

```bash
git add deploy/grobro/compose.yaml
git commit -m "build(grobro): build the patched GroBro from this repo"
git push
```

- [ ] **Step 3: Switch Dokploy `grobro` (composeId `9hvmhzh82JKQGRnj9Mz73`) to GitHub and deploy**

- `compose-update` with `sourceType: github`, `githubId: Cv6N_AgvE-fb6razCdMuL`, `owner: iddhi-sulakshana`, `repository: growatt-server`, `branch: deploy/shadowserver`, `composePath: ./deploy/grobro/compose.yaml`, `autoDeploy: false`, and env = the existing env plus `GROWATT_CLOUD_DATA_INTERVAL=300`.
- Then `compose-deploy` and watch the newest `/etc/dokploy/logs/grobro-ddj0pk/*.log` until `Docker Compose Deployed: ✅`.

- [ ] **Step 4: Verify**

- The dongle reconnects (Mosquitto log: `New client connected … as <serial>`).
- The dashboard's `/growatt/live` still streams about 2 events/s with `"source":"grobro"`.
- Over about 11 minutes, the Growatt device's `lastUpdateTime` advances in steps about 5 minutes apart (not every few seconds).
- `inverter-settings/max-charge-current` still answers HTTP 200 within the interval.
