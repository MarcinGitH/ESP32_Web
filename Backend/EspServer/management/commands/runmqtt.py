from django.core.management.base import BaseCommand
import paho.mqtt.client as mqtt
import time

from EspServer.mqtt_handler import on_connect, on_message


class Command(BaseCommand):
    help = "Runs MQTT client"

    def handle(self, *args, **kwargs):
        client = mqtt.Client()

        def on_disconnect(c, userdata, rc):
            self.stdout.write("Disconnected. Reconnecting...")
            while True:
                try:
                    c.reconnect()
                    break
                except:
                    time.sleep(5)

        client.on_connect = on_connect
        client.on_message = on_message
        client.on_disconnect = on_disconnect

        client.connect("mosquitto", 1883, 60)
        client.loop_forever()
