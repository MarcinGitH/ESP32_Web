# from django.apps import AppConfig
# import os


# class EspServerConfig(AppConfig):
#     default_auto_field = "django.db.models.BigAutoField"
#     name = "EspServer"

#     # W PWR nie mam mosquitto
#     # def ready(self):
#     #     if os.environ.get('RUN_MAIN') == 'true':  # zeby uruchomilo tylko raz
#     #         from .mqtt_handler import start_mqtt
#     #         start_mqtt()
from django.apps import AppConfig
import threading
import time
import os
import paho.mqtt.client as mqtt


def run_mqtt_client():
    from .mqtt_handler import on_connect, on_message
    client = mqtt.Client()

    def on_disconnect(c, userdata, rc):
        print("Disconnected, reconnecting...")
        while True:
            try:
                c.reconnect()
                break
            except:
                time.sleep(5)

    if os.environ.get('RUN_MAIN') == 'true':  # zeby uruchomilo tylko raz
        client.on_connect = on_connect
        client.on_disconnect = on_disconnect
        client.on_message = on_message
        client.connect("127.0.0.1", 1883, 60)
        client.loop_start()

    while True:
        time.sleep(1)


# class EspServerConfig(AppConfig):
#     default_auto_field = "django.db.models.BigAutoField"
#     name = "EspServer"

#     def ready(self):
#         # uruchamiamy klienta w osobnym wątku, aby nie blokować Django
#         thread = threading.Thread(target=run_mqtt_client, daemon=True)
#         thread.start()
