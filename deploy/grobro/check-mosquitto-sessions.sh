#!/usr/bin/env bash
# Checks that the broker keeps a dongle's session (its s/33 subscription) across a container
# recreate, as Dokploy does on deploy. Usage: check-mosquitto-sessions.sh [compose file]
# Runs a throwaway local copy of the stack (no ports published); prints PASS or FAIL.
set -euo pipefail
FILE=${1:-"$(dirname "$0")/compose.yaml"}
P=grobro-session-check
export BROKER_IP=127.0.0.1 DONGLE_SERIALS=TESTDONGLE1 GROBRO_MQTT_PASS=check-grobro READER_MQTT_PASS=check-reader
OVR=$(mktemp); trap 'docker compose -p $P -f "$FILE" -f "$OVR" down -v >/dev/null 2>&1; rm -f "$OVR"' EXIT
printf 'services:\n  mosquitto:\n    ports: !reset []\n' > "$OVR"
dc() { docker compose -p $P -f "$FILE" -f "$OVR" "$@"; }
sub() { dc exec -T mosquitto mosquitto_sub -h localhost -i TESTDONGLE1 -c -q 1 -u TESTDONGLE1 -P Growatt "$@"; }
dc up -d mosquitto >/dev/null 2>&1
sleep 2
sub -t s/33/TESTDONGLE1 -E                                   # the dongle subscribes once
dc up -d --force-recreate mosquitto >/dev/null 2>&1          # Dokploy recreates the broker
sleep 2
dc exec -T mosquitto mosquitto_pub -h localhost -u grobro -P check-grobro -q 1 -t s/33/TESTDONGLE1 -m settings-read
if got=$(sub -t none/none -C 1 -W 5 2>/dev/null) && [ "$got" = settings-read ]; then  # reconnect without subscribing
  echo "PASS: the dongle's session survived the broker recreate"
else
  echo "FAIL: the dongle's subscription was lost with the broker recreate"; exit 1
fi
