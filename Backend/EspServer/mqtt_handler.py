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


topics = {
    "firstConfigGetToken": "firstConfig",
    "firstConfigSendStatus": "firstConfigStatus",
    "cyclicData": "cyclicData",
}


def on_connect(client, userdata, flags, rc):
    print("Connected:", rc)
    client.subscribe("+", qos=0)
    client.subscribe("+/+", qos=0)


def cyclicData(payload):
    user = User.objects.get(username="marcin")
    sensors = payload.get("sensors")
    device_id = payload.get("device_id")
    # 1. Pobierz lub utwórz urządzenie
    device, created_device = Device.objects.get_or_create(
        device_serial_number=device_id,
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
            measurements_group=sensor.measurements_group,
            value=sensorMQTT['value'],

        )


# def firstConfig(client, payload, device_id):
#     user = User.objects.get(username="marcin")

#     device_name = payload.get("device_name")
#     token = payload.get("token")

#     user_token = AddDeviceToken.objects.filter(user=user).first()
#     if not user_token or not user_token.is_valid():
#         print("Token nieważny")
#         sendStatus(client, device_id, False)
#         return

#     if user_token.token != token:
#         print("Token się nie zgadza")
#         sendStatus(client, device_id, False)
#         return

#     device, created = Device.objects.get_or_create(
#         user=user,
#         device_serial_number=device_id,
#         defaults={"name": device_name}
#     )
#     if not created and device.name != device_name:
#         device.name = device_name
#         device.save()

#     sendStatus(client, device_id, True)


def firstConfig(client, payload, device_id):

    try:
        device_name = payload.get("device_name")
        token = payload.get("token")

        user_token = AddDeviceToken.objects.filter(token=token).first()
        if not user_token or not user_token.is_valid():
            print("Token nieważny")
            sendStatus(client, device_id, False)
            return

        # usun wszystkie device o danym serial number
        Device.objects.filter(
            device_serial_number=device_id
        ).delete()

        # utworz nowy device
        device = Device.objects.create(
            user=user_token.user,
            device_serial_number=device_id,
            name=device_name
        )

        sendStatus(client, device_id, True)
    except Exception as e:
        print(f"Nieoczekiwany błąd: {e}")
        sendStatus(client, device_id, False)


def sendStatus(client, device_id, ok):
    status = "OK" if ok else "NOK"
    payload = json.dumps({"status": status})

    if not client.is_connected():
        print("MQTT client not connected, nie wysyłam statusu")
        return
    print(topics["firstConfigSendStatus"] + "/" + device_id)
    client.publish(topics["firstConfigSendStatus"] + "/" + device_id, payload)


def on_message(client, userdata, msg):
    user = User.objects.get(username="marcin")
    payload = json.loads(msg.payload.decode())
    topic_parts = msg.topic.split("/")

    if (topic_parts[0] == topics["cyclicData"]):
        cyclicData(payload)
    elif (topic_parts[0] == topics["firstConfigGetToken"]):
        firstConfig(client, payload, topic_parts[1])


def start_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect("127.0.0.1", 1883, 60)
    client.loop_start()
    # return client
