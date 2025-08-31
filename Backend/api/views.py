from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import SensorWithData24hSerializer, SensorWithActualDataSerializer, SensorGroupUpdateSerializer, DeviceSerializer, AddDeviceTokenSerializer
from rest_framework import status

from datetime import datetime, timedelta
from EspServer.models import Sensor, Device, AddDeviceToken, User, DeviceConfig
from django.utils import timezone
from datetime import timedelta
import secrets


@api_view(['GET'])
def getData24h(request, measurements_group_id):
    user = "marcin"

    sensor = Sensor.objects.filter(
        device__user__username=user,
        measurements_group=measurements_group_id
    ).first()

    if not sensor:
        return Response({"error": "Sensor not found"}, status=200)

    serializer = SensorWithData24hSerializer(sensor)
    return Response(serializer.data)


@api_view(['GET'])
def userSensorsActual(request):
    user = "marcin"
    sensors = Sensor.objects.filter(device__user__username=user)
    serializer = SensorWithActualDataSerializer(sensors, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def updateSensorsGroup(request):
    serializer = SensorGroupUpdateSerializer(data=request.data, many=True)
    if serializer.is_valid():
        results = []
        for item in serializer.validated_data:
            try:
                sensor = Sensor.objects.get(id=item['id'])
                sensor.group_name = item['group_name']
                sensor.save()
                results.append({
                    "id": sensor.id,
                    "group_name": sensor.group_name
                })
            except Sensor.DoesNotExist:
                results.append({
                    "id": item['id'],
                    "error": "Sensor not found"
                })
        return Response(results, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def getDevices(request):
    user = "marcin"
    devices = Device.objects.filter(user__username=user)
    serializer = DeviceSerializer(devices, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def getSingleDevice(request, deviceId):
    user = "marcin"
    devices = Device.objects.get(
        user__username=user,
        id=deviceId)
    serializer = DeviceSerializer(devices)
    return Response(serializer.data)


@api_view(['GET'])
def getAddDeviceToken(request):
    username = "marcin"
    token_validity_min = 1

    # usuwanie starych tokenow
    AddDeviceToken.objects.filter(expires_at__lt=timezone.now()).delete()

    user = User.objects.get(username=username)
    device_token = AddDeviceToken.objects.filter(
        user=user,
        expires_at__gt=timezone.now()
    ).first()
    if (not device_token):
        device_token = AddDeviceToken.objects.create(
            user=user,
            token=secrets.token_urlsafe(8),
            expires_at=timezone.now() + timedelta(minutes=token_validity_min)
        )

    serializer = AddDeviceTokenSerializer(device_token)
    return Response(serializer.data)


@api_view(['POST'])
def updateDeviceConfig(request):
    serializer = SensorGroupUpdateSerializer(data=request.data, many=True)
    if serializer.is_valid():
        results = []
        for item in serializer.validated_data:
            try:
                sensor = Sensor.objects.get(id=item['id'])
                sensor.group_name = item['group_name']
                sensor.save()
                results.append({
                    "id": sensor.id,
                    "group_name": sensor.group_name
                })
            except Sensor.DoesNotExist:
                results.append({
                    "id": item['id'],
                    "error": "Sensor not found"
                })
        return Response(results, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
