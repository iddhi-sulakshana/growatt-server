"""
Tests for cloud-data-interval.patch: readings (Modbus function 0x04) reach the Growatt
cloud at most once every GROWATT_CLOUD_DATA_INTERVAL seconds per device; everything else
is relayed at once, and every reading is still processed locally.

Fixtures follow GroBro's own tests/test_grobro_client.py (MIT, see data/GROBRO-LICENSE).
"""

from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import paho.mqtt.client as mqtt
import pytest
from paho.mqtt.client import MQTTMessage

import grobro.grobro.client as grobro_client
from grobro.grobro.client import Client
from grobro.model.mqtt_config import MQTTConfig

DATA_DIR = Path(__file__).parent / "data"

DEVICE_A = "HAQ0TEST000001"
DEVICE_B = "HAQ0TEST000002"


def _msg(topic: str, payload: bytes) -> MQTTMessage:
    m = MagicMock(spec=MQTTMessage)
    m.topic = topic
    m.payload = payload
    m.qos = 0
    m.retain = False
    m.properties.json.return_value = {"UserProperty": []}
    return m


def _message(function: int) -> bytes:
    """A message whose clear 8-byte header ends in the given Modbus function byte."""
    return b"\x00\x01\x00\x07\x02\x41\x00" + bytes([function]) + bytes(32)


@pytest.fixture
def mock_mqtt():
    with patch("grobro.grobro.client.mqtt.Client") as mock_cls:
        instance = MagicMock()
        instance.publish.return_value = (0, MagicMock())
        mock_cls.return_value = instance
        yield instance


@pytest.fixture
def client(mock_mqtt):
    c = Client(MQTTConfig(host="localhost", port=1883), MQTTConfig(host="forward.com", port=7006))
    c.on_config = MagicMock()
    c.on_input_register = MagicMock()
    c.on_holding_register_input = MagicMock()
    c.on_config_read_response = MagicMock()
    return c


@pytest.fixture
def cloud(client):
    """Cloud relay on for every device, a 300 s interval, a fake clock and a fake cloud link."""
    clock = {"now": 0.0}
    fc = MagicMock()
    fc.publish.return_value.rc = mqtt.MQTT_ERR_SUCCESS
    with (
        patch.object(grobro_client, "GROWATT_CLOUD", "true"),
        patch.object(grobro_client, "GROWATT_CLOUD_ENABLED", True),
        patch.object(grobro_client, "GROWATT_CLOUD_DATA_INTERVAL", 300, create=True),
        patch.object(grobro_client, "time", SimpleNamespace(monotonic=lambda: clock["now"]), create=True),
        patch.object(client, "_Client__connect_to_growatt_server", return_value=fc),
    ):
        yield SimpleNamespace(client=client, fc=fc, clock=clock)


def _send(cloud, device: str, payload: bytes, at: float) -> None:
    cloud.clock["now"] = at
    cloud.client._client.on_message(None, None, _msg(f"c/33/{device}", payload))


def test_first_reading_relayed_then_held_then_relayed_after_interval(cloud):
    for at in (0, 10, 299, 300):
        _send(cloud, DEVICE_A, _message(0x04), at)
    assert cloud.fc.publish.call_count == 2


def test_non_reading_messages_always_relayed(cloud):
    for function in (0x03, 0x05, 0x06, 0x19):
        _send(cloud, DEVICE_A, _message(function), 0)
        _send(cloud, DEVICE_A, _message(function), 10)
    assert cloud.fc.publish.call_count == 8


def test_settings_relayed_while_readings_held_back(cloud):
    _send(cloud, DEVICE_A, _message(0x04), 0)
    _send(cloud, DEVICE_A, _message(0x05), 10)
    _send(cloud, DEVICE_A, _message(0x06), 11)
    _send(cloud, DEVICE_A, _message(0x04), 20)
    _send(cloud, DEVICE_A, _message(0x04), 300)
    functions = [call.kwargs["payload"][7] for call in cloud.fc.publish.call_args_list]
    assert functions == [0x04, 0x05, 0x06, 0x04]


def test_failed_cloud_connect_does_not_use_up_the_interval(cloud):
    connect = cloud.client._Client__connect_to_growatt_server
    connect.side_effect = [OSError("no route to mqtt.growatt.com"), cloud.fc]
    _send(cloud, DEVICE_A, _message(0x04), 0)
    _send(cloud, DEVICE_A, _message(0x04), 1)
    assert cloud.fc.publish.call_count == 1


def test_unsent_reading_does_not_use_up_the_interval(cloud):
    not_connected = MagicMock(rc=mqtt.MQTT_ERR_NO_CONN)
    sent = MagicMock(rc=mqtt.MQTT_ERR_SUCCESS)
    cloud.fc.publish.side_effect = [not_connected, sent, sent]
    _send(cloud, DEVICE_A, _message(0x04), 0)
    _send(cloud, DEVICE_A, _message(0x04), 5)
    _send(cloud, DEVICE_A, _message(0x04), 10)
    assert cloud.fc.publish.call_count == 2


def test_interval_zero_relays_every_reading(cloud):
    with patch.object(grobro_client, "GROWATT_CLOUD_DATA_INTERVAL", 0, create=True):
        for at in (0, 1, 2):
            _send(cloud, DEVICE_A, _message(0x04), at)
    assert cloud.fc.publish.call_count == 3


def test_devices_throttled_independently(cloud):
    _send(cloud, DEVICE_A, _message(0x04), 0)
    _send(cloud, DEVICE_A, _message(0x04), 10)
    _send(cloud, DEVICE_B, _message(0x04), 10)
    topics = [call.args[0] for call in cloud.fc.publish.call_args_list]
    assert topics == [f"c/33/{DEVICE_A}", f"c/33/{DEVICE_B}"]


def test_empty_payload_relayed(cloud):
    _send(cloud, DEVICE_A, b"", 0)
    assert cloud.fc.publish.call_count == 1


def test_held_back_reading_still_processed_locally(cloud):
    data = (DATA_DIR / "NeoInputRegister.bin").read_bytes()
    for at in (0, 10):
        cloud.clock["now"] = at
        cloud.client._client.on_message(None, None, _msg("c/33/QMN000ABC1D2E3FG", data))
    assert cloud.client.on_input_register.call_count == 2
    assert cloud.fc.publish.call_count == 1
