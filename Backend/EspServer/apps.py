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
import ssl

BROKERS = {
    "local": {"host": "127.0.0.1", "port": 1883, "tls": False},
    "hive": {
        "host": "68e9211143cb4c51a6546fb79a33ac42.s1.eu.hivemq.cloud",
        "port": 8883,
        "tls": True,
        "username": "hivemq.webclient.1772321821542",
        "password": "cxg8buy.C723T$>JDOH*"
    }
}


def connect_mqtt(broker_key="local"):
    from .mqtt_handler import on_connect, on_message
    cfg = BROKERS[broker_key]

    client = mqtt.Client()

    if cfg.get("username") and cfg.get("password"):
        client.username_pw_set(cfg["username"], cfg["password"])

    if cfg.get("tls"):
        client.tls_set(cert_reqs=ssl.CERT_NONE)  # lub ustaw certyfikat CA
        # ignoruje weryfikację certyfikatu
        client.tls_insecure_set(True)
    if os.environ.get('RUN_MAIN') == 'true':
        client.on_connect = on_connect
        client.on_message = on_message
        client.connect(cfg["host"], cfg["port"], 60)
        client.loop_start()


def run_mqtt_client():
    connect_mqtt('local')
    connect_mqtt('hive')

    while True:
        time.sleep(1)


class EspServerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "EspServer"

    def ready(self):
        # uruchamiamy klienta w osobnym wątku, aby nie blokować Django
        thread = threading.Thread(target=run_mqtt_client, daemon=True)
        thread.start()
