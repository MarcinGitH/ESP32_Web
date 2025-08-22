from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import DeviceDataSerializer

from datetime import datetime, timedelta
from EspServer.models import SensorData
from django.utils import timezone
from datetime import timedelta


@api_view(['GET'])
def user_devices(request, sensorId):
    user = "marcin"

    time_threshold = timezone.now() - timedelta(hours=24)

    data = SensorData.objects.filter(
        sensor__device__user__username=user,
        sensor__sensor_id=sensorId,
        timestamp__gte=time_threshold
    ).order_by("timestamp")

    serializer = DeviceDataSerializer(data, many=True)
    return Response(serializer.data)
