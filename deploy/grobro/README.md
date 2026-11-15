# GroBro stack (Dokploy)

Mosquitto plus a patched [GroBro](https://github.com/robertzaage/GroBro) v2.7.5 for a Growatt
Shine WiFi-F Pro dongle. The dongle publishes to this broker instead of `mqtt.growatt.com:7006`.
GroBro decodes each reading for the dashboard (real time, about one per second) and relays the
dongle's traffic to the Growatt cloud, so the portal, the app and the settings controls keep working.

## The patch: readings reach the Growatt cloud every 5 minutes

`cloud-data-interval.patch` changes one thing in `grobro/grobro/client.py`: readings go to the
Growatt cloud at most once every `GROWATT_CLOUD_DATA_INTERVAL` seconds per dongle.

- **What counts as a reading:** Modbus function `0x04` (input registers), the low byte of the
  message type at offset 7 of the header, which GroBro's scrambling leaves in clear. Each `0x04`
  message carries the whole reading (registers 0–134 and 200–289), so the cloud gets complete data.
- **What is never held:** everything else goes through at once. That covers settings reads and
  writes (`0x05`/`0x06`), holding registers (`0x03`), config (`0x18`/`0x19`/`0x29`) and empty messages.
- **Local processing is untouched:** every reading still reaches the dashboard.
- **Only a delivered reading starts the next interval.** The cloud link is created for every
  message, and the interval starts only when a reading's publish succeeds. A failed connect, or a
  reading sent while the link is still coming up, doesn't cost a whole interval. Without this, the
  first reading after a GroBro restart was lost and the cloud went 5 minutes without data.
- `GROWATT_CLOUD_DATA_INTERVAL=0`, the default in the patch, behaves exactly like upstream.
  `compose.yaml` sets 300.

## Mosquitto keeps sessions

The dongle connects with a persistent session and may not subscribe again to its command topic
(`s/33/<serial>`) after the broker restarts. When that happens, settings commands from the cloud
and the dashboard never reach it (`zfdyh_Read_failure`) until the dongle is power-cycled. So
Mosquitto runs with `persistence true` on the `mosquitto-data` volume, and the subscription
survives restarts and Dokploy redeploys. Subscribes are logged (`log_type subscribe`).

If settings reads fail anyway, check the Mosquitto log for `<serial> 1 s/33/<serial>` after the
dongle's last `New client connected`. If the line is missing, unplug the dongle for 10 s.

## Tests

```bash
docker build --target test deploy/grobro       # the patch's pytest suite; the final image depends on it
deploy/grobro/check-mosquitto-sessions.sh      # a dongle's subscription survives a broker recreate
```

## Deploy

Dokploy compose `grobro` builds `deploy/grobro/compose.yaml` from this branch. Auto-deploy is
off, so deploy from Dokploy after pushing. Dokploy provides `BROKER_IP`, `DONGLE_SERIALS`,
`GROBRO_MQTT_PASS`, `READER_MQTT_PASS` and optionally `GROWATT_CLOUD_DATA_INTERVAL`.

`tests/data/NeoInputRegister.bin` comes from GroBro's MIT-licensed tests; see `tests/data/GROBRO-LICENSE`.
