import json
import paho.mqtt.client as mqtt
from datetime import datetime
from .models import Device, Sensor, SensorData, AddDeviceToken
from django.contrib.auth.models import User

# Cykliczne wysylanie danych przez ESP

# topic: cyclicData
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

# Pierwsze przypisanie urzadzenia
# topic: firstConfig
# {
#     "device_id" : "device1234"
#     "device_name":"Urzadzenie 1"
#     "token":"6gikReJKpKM"
# }
client = None


def on_connect(client, userdata, flags, rc):
    print("Connected:", rc)
    client.subscribe("+", qos=0)


def cyclicData(payload):
    user = User.objects.get(username="marcin")
    sensors = payload.get("sensors")
    device_id = payload.get("device_id")
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


def firstConfig(payload):
    global client
    user = User.objects.get(username="marcin")

    device_id = payload.get("device_id")
    device_name = payload.get("device_name")
    token = payload.get("token")

    user_token = AddDeviceToken.objects.filter(user=user).first()
    if not user_token or not user_token.is_valid():
        print("Token nieważny")
        sendStatus(False)
        return

    if user_token.token != token:
        print("Token się nie zgadza")
        sendStatus(False)
        return

    device, created = Device.objects.get_or_create(
        user=user,
        device_id=device_id,
        defaults={"name": device_name}
    )
    if not created and device.name != device_name:
        device.name = device_name
        device.save()

    sendStatus(True)


def sendStatus(ok):
    global client
    status = "OK" if ok else "NOK"
    payload = json.dumps({"status": status})

    if not client.is_connected():
        print("MQTT client not connected, nie wysyłam statusu")
        return

    # Uruchamiamy loop w tle, żeby wysyłka działała
    # client.loop_start()
    info = client.publish("firstConfigStatus", payload)
    info.wait_for_publish()
    print("xd")
    # client.loop_stop()

    if info.is_published():
        print(f"Published {status} to firstConfigStatus")
    else:
        print(f"Failed to publish {status}, rc={info.rc}")


def on_message(client, userdata, msg):
    user = User.objects.get(username="marcin")
    payload = json.loads(msg.payload.decode())
    topic_parts = msg.topic.split("/")

    if (topic_parts[0] == "cyclicData"):
        cyclicData(payload=payload)
    elif (topic_parts[0] == "firstConfig"):
        firstConfig(payload=payload)


def start_mqtt():
    global client
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect("127.0.0.1", 1883, 60)
    client.loop_start()
    # return client
