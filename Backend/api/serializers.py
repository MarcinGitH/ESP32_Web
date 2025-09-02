from rest_framework import serializers
from EspServer.models import SensorData, Sensor, Device, AddDeviceToken, MeasurementsGroup
from django.utils import timezone
from datetime import timedelta


class MeasurementGroupCreateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(allow_blank=False, required=True)
    # created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = MeasurementsGroup
        fields = ["id", "name"]


class MeasurementGroupSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    name = serializers.CharField(allow_blank=False, required=True)
    # created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = MeasurementsGroup
        fields = ["id", "name"]


class SensorDataSerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = SensorData
        fields = ["value", "timestamp"]

    def get_timestamp(self, obj):
        return int(obj.timestamp.timestamp())


class SensorWithData24hSerializer(serializers.ModelSerializer):
    data = serializers.SerializerMethodField()
    actual_value = serializers.SerializerMethodField()
    measurements_group = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = ["id", "measurements_group",
                  "group_name", "actual_value", "data"]

    def get_data(self, obj):
        if not obj.measurements_group:
            return None

        time_threshold = timezone.now() - timedelta(hours=24)
        recent_data = obj.measurements_group.data.filter(
            timestamp__gte=time_threshold).order_by("timestamp")
        return SensorDataSerializer(recent_data, many=True).data

    def get_actual_value(self, obj):
        if not obj.measurements_group:
            return None

        time_threshold = timezone.now() - timedelta(minutes=2)

        # ostatnia próbka sprzed 2 minut
        last_data = obj.measurements_group.data.filter(
            timestamp__gte=time_threshold).order_by('-timestamp').first()
        return last_data.value if last_data else None

    def get_measurements_group(self, obj):
        if not obj.measurements_group:
            return None
        return MeasurementGroupSerializer(obj.measurements_group).data


class SensorWithActualDataSerializer(serializers.ModelSerializer):
    actual_value = serializers.SerializerMethodField()
    measurements_group = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = ["id", "sensor_id", "measurements_group",
                  "group_name", "actual_value", "pin_number"]

    def get_actual_value(self, obj):
        if not obj.measurements_group:
            return None

        time_threshold = timezone.now() - timedelta(minutes=2)

        # ostatnia próbka sprzed 2 minut
        last_data = obj.measurements_group.data.filter(
            timestamp__gte=time_threshold).order_by('-timestamp').first()
        return last_data.value if last_data else None

    def get_measurements_group(self, obj):
        if not obj.measurements_group:
            return None
        return MeasurementGroupSerializer(obj.measurements_group).data


class SensorGroupUpdateSerializer(serializers.Serializer):
    id = serializers.CharField()
    group_name = serializers.CharField(max_length=100)


class DeviceSerializer(serializers.ModelSerializer):
    sensors = serializers.SerializerMethodField()

    # online = serializers.SerializerMethodField()

    class Meta:
        model = Device
        fields = ["id", "device_serial_number", "name",
                  "online", "sensors"]

    def get_sensors(self, obj):
        sensor_data = obj.sensors.all()
        return SensorWithActualDataSerializer(sensor_data, many=True).data


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


class SensorUpdateSerializer(serializers.ModelSerializer):
    measurements_group = MeasurementGroupSerializer()  # tylko do walidacji id grupy
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Sensor
        fields = ["id", "sensor_id", "group_name",
                  "measurements_group", "pin_number"]


class DeviceUpdateSerializer(serializers.ModelSerializer):
    sensors = SensorUpdateSerializer(many=True)

    class Meta:
        model = Device
        # tylko te pola aktualizujemy, reszta JSON-a zostanie zignorowana
        fields = ["name", "sensors"]

    def update(self, instance, validated_data):
        # aktualizacja name
        instance.name = validated_data.get("name", instance.name)
        instance.save()
        sensors_data = validated_data.pop("sensors", [])

        # obsluga usuwania sensorow
        sensors_id_update_list = []

        for sensor_data in sensors_data:
            sensors_id_update_list.append(sensor_data["sensor_id"])

        device_sensors = Sensor.objects.filter(device=instance)
        for sensor in device_sensors:
            if (sensor.sensor_id not in sensors_id_update_list):
                sensor.delete()

        # aktualizacja sensorów
        for sensor_data in sensors_data:
            sensor, created = Sensor.objects.get_or_create(
                sensor_id=sensor_data["sensor_id"],
                device=instance,
                defaults={
                    "measurements_group": MeasurementsGroup.objects.get(id=sensor_data["measurements_group"]["id"]),
                    "pin_number": sensor_data["pin_number"],
                }
            )
            if not created:
                sensor.measurements_group = MeasurementsGroup.objects.get(
                    id=sensor_data["measurements_group"]["id"])
                sensor.pin_number = sensor_data["pin_number"]
                sensor.save()

        return instance
