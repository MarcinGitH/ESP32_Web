import json
import paho.mqtt.client as mqtt
from datetime import datetime
from .models import Device, Sensor, SensorData, AddDeviceToken
from django.utils import timezone

# Cykliczne wysylanie danych przez ESP

# topic: cyclicData
# {
#   "device_serial_number": "device123",
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
    client.subscribe("+/+/+", qos=0)


def cyclicData(payload):

    sensors = payload.get("sensors")
    device_serial_number = payload.get("device_serial_number")
    print(device_serial_number)
    try:
        device = Device.objects.get(
            device_serial_number=device_serial_number,
        )
        print(device)
        for sensorMQTT in sensors:
            sensor = Sensor.objects.get(
                device=device,
                sensor_id=sensorMQTT['sensor_id'],
            )

            if (sensor.measurements_group):
                SensorData.objects.create(
                    measurements_group=sensor.measurements_group,
                    value=sensorMQTT['value'],
                )
    except:
        print("Blad ladowania danych do DB z MQTT")


def firstConfig(client, payload, device_serial_number):
    sensors_names = {1: 'Temperatura',
                     2: 'Wilgotność',
                     3: 'Ciśnienie',
                     4: 'Temperatura zewn. 1',
                     5: 'Temperatura zewn. 2',
                     6: 'Temperatura zewn. 3', }

    try:
        device_name = payload.get("device_name")
        token = payload.get("token")

        user_token = AddDeviceToken.objects.filter(token=token).first()
        if not user_token or not user_token.is_valid():
            print("Token nieważny")
            sendStatus(client, device_serial_number, False)
            return

        # usun wszystkie device o danym serial number
        # Device.objects.filter(
        #     device_serial_number=device_serial_number
        # ).delete()

        # # utworz nowy device
        # device = Device.objects.create(
        #     user=user_token.user,
        #     device_serial_number=device_serial_number,
        #     name=device_name
        # )

        device, created = Device.objects.get_or_create(
            device_serial_number=device_serial_number,
            user=user_token.user,
            defaults={
                "user": user_token.user,
                "device_serial_number": device_serial_number,
                "name": device_name,
                "last_seen": timezone.now(),
            }
        )

        if not created:
            device.name = device_name
            device.user = user_token.user
            device.created_at = timezone.now()
            device.save()

        # utworzenie czujnikow dla urzadzenia, jesli istnieja to wykasowanie przypisania grup pomiarow i group_name
        sensors = Sensor.objects.filter(device_id=device.id)

        if sensors.exists():
            sensors.update(group_name="Inne", measurements_group=None)
        else:
            for sensor_number, sensor_name in sensors_names.items():
                Sensor.objects.create(
                    sensor_id=sensor_number,
                    group_name="Inne",
                    device=device,
                    measurements_group_id=None,
                    type_of_sensor=sensor_name
                )

        sendStatus(client, device_serial_number, True)
    except Exception as e:
        print(f"Nieoczekiwany błąd: {e}")
        sendStatus(client, device_serial_number, False)


def sendStatus(client, device_id, ok):
    status = "OK" if ok else "NOK"
    payload = json.dumps({"status": status})

    if not client.is_connected():
        print("MQTT client not connected, nie wysyłam statusu")
        return

    client.publish(topics["firstConfigSendStatus"] + "/" + device_id, payload)


# topic: setConfig/config/device_serial_number
# data: {
#       sensors:[
#     {
#         sensor_id:1,
#         pin_number:14
#         },
#       ....]
#        }

def sendConfig(client, payload, device_serial_number):
    sensors_payload = []
    request = payload.get("request")
    if (request != "get_config"):
        return

    sensors = Sensor.objects.filter(
        device__device_serial_number=device_serial_number
    )

    for sensor in sensors:
        sensors_payload.append(
            {"sensor_id": sensor.sensor_id, "pin_number": sensor.pin_number})

    payload = json.dumps({"sensors": sensors_payload})

    client.publish("setConfig/config/" + device_serial_number, payload)


def pingHandle(client, payload, device_serial_number):
    print(payload)
    try:
        device = Device.objects.get(device_serial_number=device_serial_number)
        pingStatus = payload.get("ping_status", "")
        battery_percent = payload.get("battery_percent", None)
        charging = payload.get("charging", None)
        if pingStatus == "OK":
            device.last_seen = timezone.now()
            device.last_battery_percent = battery_percent
            device.charging = charging
            device.save()
            print("Ping: " + device_serial_number + " Battery: " + battery_percent + "Charging: " + charging)
    except:
        pass


def on_message(client, userdata, msg):

    payload = json.loads(msg.payload.decode())
    topic_parts = msg.topic.split("/")

    if (topic_parts[0] == topics["cyclicData"]):
        cyclicData(payload)
    elif (topic_parts[0] == topics["firstConfigGetToken"]):
        firstConfig(client, payload, topic_parts[1])
    elif (topic_parts[0] == "ping"):
        pingHandle(client, payload, topic_parts[1])
    # elif (topic_parts[0] == "setConfig" and topic_parts[1] == "request"):
    #     sendConfig(client, payload, topic_parts[2])
