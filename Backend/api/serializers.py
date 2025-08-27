from rest_framework import serializers
from EspServer.models import SensorData, Sensor, Device,AddDeviceToken
from django.utils import timezone
from datetime import timedelta


class DataSerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = SensorData
        fields = ["value", "timestamp"]

    def get_timestamp(self, obj):
        return int(obj.timestamp.timestamp())


class SensorWithData24hSerializer(serializers.ModelSerializer):
    data = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = ["id", "name", "group_name", "data"]

    def get_data(self, obj):
        time_threshold = timezone.now() - timedelta(hours=24)
        recent_data = obj.data.filter(
            timestamp__gte=time_threshold).order_by("timestamp")
        return DataSerializer(recent_data, many=True).data


class SensorWithActualDataSerializer(serializers.ModelSerializer):
    actual_value = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = ["id", "name", "group_name", "actual_value"]

    def get_actual_value(self, obj):
        time_threshold = timezone.now() - timedelta(minutes=2)
        # ostatnia próbka sprzed 2 minut
        last_data = obj.data.filter(
            timestamp__gte=time_threshold).order_by('-timestamp').first()
        return last_data.value if last_data else None


class SensorGroupUpdateSerializer(serializers.Serializer):
    id = serializers.CharField()
    group_name = serializers.CharField(max_length=100)


class DevicesSerializer(serializers.ModelSerializer):
    sensors = serializers.SerializerMethodField()
    online = serializers.SerializerMethodField()

    class Meta:
        model = Device
        fields = ["device_id", "name", "online", "sensors"]

    def get_sensors(self, obj):
        sensor_data = obj.sensors.all()
        return SensorWithActualDataSerializer(sensor_data, many=True).data

    def get_online(self, obj):
        time_threshold = timezone.now() - timedelta(minutes=2)
        # sprawdzamy czy istnieją jakieś dane nowsze niż próg
        return SensorData.objects.filter(
            sensor__device=obj,
            timestamp__gte=time_threshold
        ).exists()

class AddDeviceTokenSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()
    expires_at = serializers.SerializerMethodField()

    class Meta:
        model = AddDeviceToken
        fields = ["token", "created_at", "expires_at"]

    def get_created_at(self, obj):
        return int(obj.created_at.timestamp()*1000)
    
    def get_expires_at(self, obj):
        return int(obj.expires_at.timestamp()*1000)