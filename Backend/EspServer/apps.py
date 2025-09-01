from django.apps import AppConfig
import os


class EspServerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "EspServer"

    # W PWR nie mam mosquitto
    def ready(self):
        if os.environ.get('RUN_MAIN') == 'true':  # zeby uruchomilo tylko raz
            from .mqtt_handler import start_mqtt
            start_mqtt()
