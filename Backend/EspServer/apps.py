from django.apps import AppConfig


class EspServerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "EspServer"

    # W PWR nie mam mosquitto
    # def ready(self):
    #     from .mqtt_handler import start_mqtt
    #     start_mqtt()
