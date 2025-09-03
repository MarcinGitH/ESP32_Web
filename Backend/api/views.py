from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import *
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.generics import GenericAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from datetime import datetime, timedelta
from EspServer.models import Sensor, Device, AddDeviceToken, MeasurementsGroup
from django.utils import timezone
from datetime import timedelta
import secrets
import time
from django.contrib.auth import get_user_model


#User views
class UserRegistrationAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def post(self,request,*args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh":str(token),
                          "access":str(token.access_token)}
        return Response(data,status=status.HTTP_201_CREATED)

class UserLoginAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer

    def post(self,request,*args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception = True)
        user = serializer.validate_data
        serializer = CustomUserSerializer(user)
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh":str(token),
                          "access":str(token.access_token)}
        return Response(data,status=status.HTTP_200_OK)
    
class UserLogoutAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self,request,*args, **kwargs):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)




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
def getDeviceList(request):
    user = "marcin"
    devices = Device.objects.filter(user__username=user)
    available_measurement_groups = MeasurementsGroup.objects.filter(
        mg_sensors__isnull=True,
        user__username=user)

    all_measurement_groups = MeasurementsGroup.objects.filter(
        user__username=user
    )

    return Response({
        "devices": DeviceSerializer(devices, many=True).data,
        "available_measurement_groups": MeasurementGroupSerializer(available_measurement_groups, many=True).data,
        "all_measurement_groups": MeasurementGroupSerializer(all_measurement_groups, many=True).data,
    })


@api_view(['GET'])
def getSingleDevice(request, deviceId):
    user = "marcin"
    device = Device.objects.get(
        user__username=user,
        id=deviceId)
    available_measurement_groups = MeasurementsGroup.objects.filter(
        mg_sensors__isnull=True,
        user__username=user)

    return Response({
        "device": DeviceSerializer(device).data,
        "available_measurement_groups": MeasurementGroupSerializer(available_measurement_groups, many=True).data,
    })


@api_view(['GET'])
def getAddDeviceToken(request):
    username = "marcin"
    token_validity_min = 1

    # usuwanie starych tokenow
    AddDeviceToken.objects.filter(expires_at__lt=timezone.now()).delete()
    User = get_user_model()
    user = User.objects.get(username=username)
    device_token = AddDeviceToken.objects.filter(
        user=user,
        expires_at__gt=timezone.now()
    ).first()
    if (not device_token):
        device_token = AddDeviceToken.objects.create(
            user=user,
            token=secrets.token_urlsafe(4),
            expires_at=timezone.now() + timedelta(minutes=token_validity_min)
        )

    serializer = AddDeviceTokenSerializer(device_token)
    return Response(serializer.data)


@api_view(['POST'])
def updateDeviceConfig(request):
    # pobieramy device_id z JSON-a
    device_id = request.data.get("id")

    if not device_id:
        return Response({"error": "Device id not provided"}, status=400)

    try:
        device = Device.objects.get(id=device_id)
    except Device.DoesNotExist:
        return Response({"error": "Device not found"}, status=404)

    serializer = DeviceUpdateSerializer(
        device, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)

    return Response(serializer.errors, status=400)


@api_view(['POST'])
def updateMeasureGroups(request):
    User = get_user_model()
    user = User.objects.get(
        username="marcin"
    )

    # usuwanie grup
    user_measure_groups = MeasurementsGroup.objects.filter(
        user=user
    )

    new_groups_ids = [group["id"] for group in request.data]

    for group in user_measure_groups:
        if group.id not in new_groups_ids:
            group.delete()

    for group in request.data:
        group_id = group.get("id")

        if group_id > -1:
            try:
                existing_group = MeasurementsGroup.objects.get(id=group_id)
            except:
                continue

            serializer = MeasurementGroupCreateSerializer(
                existing_group, data=group, partial=True)
        else:

            serializer = MeasurementGroupCreateSerializer(data=group)

        if serializer.is_valid():
            serializer.save(user=user)
        else:
            return Response({"status:'ERROR'"}, status=400)

    return Response({"status:'OK'"}, status=200)


@api_view(['POST'])
def deleteDevices(request):
    # pobieramy device_id z JSON-a
    all_devices = Device.objects.filter(
        user__username="marcin"
    )

    devices_from_api = [device.get("id")
                        for device in request.data]

    for device in all_devices:
        if device.id not in devices_from_api:
            print(f"Deleted id: {device.id}" + str(device.id))
            device.delete()

    return Response({"errors:'OK'"}, status=200)
