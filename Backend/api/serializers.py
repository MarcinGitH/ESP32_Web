from rest_framework import serializers


class DeviceDataSerializer(serializers.Serializer):
    device_id = serializers.CharField()
    value = serializers.FloatField()
