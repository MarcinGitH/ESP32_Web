from rest_framework import serializers
from EspServer.models import SensorData


class DeviceDataSerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = SensorData
        fields = ["value", "timestamp"]

    def get_timestamp(self, obj):
        return int(obj.timestamp.timestamp())
