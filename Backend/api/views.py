from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import DeviceDataSerializer
import redis
from datetime import datetime, timedelta


@api_view(['GET'])
def user_devices(request):
    recent_values = [
        {"device_id": 1, "value": 20},
        {"device_id": 2, "value": 3},
        {"device_id": 3, "value": 13}
    ]

    # Serializacja danych
    serializer = DeviceDataSerializer(recent_values, many=True)
    return Response(serializer.data)
