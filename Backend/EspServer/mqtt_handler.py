import json
import paho.mqtt.client as mqtt
from datetime import datetime
from .models import Device, Sensor, SensorData
from django.contrib.auth.models import User


def on_connect(client, userdata, flags, rc):
    print("Connected:", rc)
    client.subscribe("device/+/data", qos=0)

# {
#   "device_id": "device123",
#   "sensors": [
#     {
#       "sensor_id": "1",
#       "value": 23.5
#     },
#     {
#       "sensor_id": "2",
#       "value": 60.2
#     }
#   ]
# }


def on_message(client, userdata, msg):
    user = User.objects.get(username="marcin")
    payload = json.loads(msg.payload.decode())
    topic_parts = msg.topic.split("/")
    device_id = topic_parts[1]

    # value = payload.get("value")
    sensors = payload.get("sensors")

    # 1. Pobierz lub utwórz urządzenie
    device, created_device = Device.objects.get_or_create(
        device_id=device_id,
        # przypisz użytkownika tylko jeśli tworzysz nowe
        defaults={"user": user}
    )

    for sensorMQTT in sensors:
        # 2. Pobierz lub utwórz sensor
        sensor, created_sensor = Sensor.objects.get_or_create(
            device=device,
            id=sensorMQTT['sensor_id'],
            defaults={"name": "sensor_name"}
        )

        # 3. Zapisz dane
        SensorData.objects.create(
            sensor=sensor,
            value=sensorMQTT['value'],

        )


def start_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect("127.0.0.1", 1883, 60)
    client.loop_start()
    return client
