
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class AddDeviceToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=12, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return timezone.now() < self.expires_at




class Device(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='devices')
    device_serial_number = models.CharField(max_length=100, unique=True)
    # opcjonalna nazwa urządzenia
    name = models.CharField(max_length=100, blank=True, null=True)
    last_seen = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.name or self.device_id}"




class Sensor(models.Model):
    class PinNumber(models.IntegerChoices):
        ONE = 1, "1"
        TWO = 2, "2"
        THREE = 3, "3"
        FOUR = 4, "4"

    device = models.ForeignKey(
        Device, on_delete=models.CASCADE, related_name='sensors')
    name = models.CharField(max_length=100, default="sensor name")
    group_name = models.CharField(max_length=100, default="Inne")
    pin_number = models.IntegerField(choices=PinNumber.choices,default=1)
    # class Meta:
    #     # sensor_id unikalny w obrębie device
    #     unique_together = ('device', 'sensor_id')

    def __str__(self):
        return f"{self.name} ({self.sensor_id})"

class DeviceConfig(models.Model):
    class PinNumber(models.IntegerChoices):
        ONE = 1, "1"
        TWO = 2, "2"
        THREE = 3, "3"
        FOUR = 4, "4"

    class PinFunction(models.TextChoices):
        TEMPERATURE_SENSOR = "TEMP", "Czujnik temperatury"
        SWITCH = "SWITCH", "Wyjście ON/OFF"

    device = models.ForeignKey(Device,on_delete=models.CASCADE,related_name="configs")   # Device.configs.all() -> lista pinów
    pin_number = models.IntegerField(choices=PinNumber.choices)
    pin_function = models.CharField(max_length=50, choices=PinFunction.choices)
    sensor = models.ForeignKey(Sensor, on_delete=models.SET_NULL, null=True, blank=True, related_name="pin_config")

class SensorData(models.Model):
    sensor = models.ForeignKey(
        Sensor, on_delete=models.CASCADE, related_name='data')
    timestamp = models.DateTimeField(auto_now_add=True)
    value = models.FloatField()

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.sensor.name}: {self.value} @ {self.timestamp}"
