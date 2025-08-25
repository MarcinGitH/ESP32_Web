from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import SensorWithData24hSerializer,SensorWithActualDataSerializer,SensorGroupUpdateSerializer
from rest_framework import status

from datetime import datetime, timedelta
from EspServer.models import Sensor
from django.utils import timezone
from datetime import timedelta


@api_view(['GET'])
def getData24h(request, sensorId):
    user = "marcin"

    sensor = Sensor.objects.filter(
        device__user__username=user,
        id=sensorId
    ).first()

    if not sensor:
        return Response({"error": "Sensor not found"}, status=404)

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