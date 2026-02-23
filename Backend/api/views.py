from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import *
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError
from datetime import datetime, timedelta, time
from EspServer.models import Sensor, Device, AddDeviceToken, MeasurementsGroup
from django.utils import timezone

import secrets

from django.contrib.auth import get_user_model
from django.db.models import Avg, DateTimeField
from django.db.models.functions import TruncDate, Cast


# User views


class UserRegistrationAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token),
                          "access": str(token.access_token)}
        return Response(data, status=status.HTTP_201_CREATED)


class UserLoginAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer = CustomUserSerializer(user)
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token),
                          "access": str(token.access_token)}
        return Response(data, status=status.HTTP_200_OK)


class UserLogoutAPIView(GenericAPIView):
    # permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh"]

            token = RefreshToken(refresh_token)

            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:

            if str(e) == "Token znajduję się na czarnej liście":
                return Response(status=status.HTTP_205_RESET_CONTENT)
            else:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserInfoAPIView(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer

    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getData24h(request, measurements_group_id):
    user = request.user

    sensor = Sensor.objects.filter(
        device__user=user,
        measurements_group=measurements_group_id
    ).first()
    print(sensor.id)
    if not sensor:
        return Response({"error": "Sensor not found"}, status=200)

    serializer = SensorWithData24hSerializer(sensor)
    return Response(serializer.data,)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getChartData(request, selected_group):
    user = request.user
    start_date_str = request.GET.get("start_date")
    end_date_str = request.GET.get("end_date")

    date_format = "%Y-%m-%d %H:%M:%S"

    try:
        start_date = datetime.strptime(start_date_str, date_format)
        end_date = datetime.strptime(end_date_str, date_format)
    except Exception as e:
        return Response({"error": f"Nieprawidłowy format daty: {e}"}, status=400)

    # Jesli zakres mniejszy niz 7 dni to wyslij wszytkie dane
    if end_date - start_date < timedelta(days=7):
        data = SensorData.objects.filter(
            measurements_group__user=user,
            measurements_group=selected_group,
            timestamp__gt=start_date,
            timestamp__lt=end_date
        )
        serializer = SensorDataSerializer(data, many=True)
        result = serializer.data

    # Jesli zakres wiekszy niz 7 dni i mniejszy niz 31 to wyslij srednia z kazdego dnia
    else:
        data = (
            SensorData.objects
            .filter(
                measurements_group__user=user,
                measurements_group=selected_group,
                timestamp__gt=start_date,
                timestamp__lt=end_date)
            .annotate(day=TruncDate('timestamp'))
            .annotate(day_ts=Cast('day', DateTimeField()))
            .values('day_ts')
            .annotate(avg_value=Avg('value'))
            .order_by('day_ts')
        )

        # Mapujemy dane z bazy do słownika: {day: value}
        avg_by_day = {
            d["day_ts"].date(): d["avg_value"] for d in data
        }

        # Budujemy pełną listę dni z nullami dla brakujących dat
        current_day = start_date.date()
        end_day = end_date.date()
        result = []

        while current_day <= end_day:
            dt = datetime.combine(current_day, datetime.min.time())
            result.append({
                "timestamp": int(dt.timestamp() * 1000),
                "value": avg_by_day.get(current_day, None)
            })
            current_day += timedelta(days=1)

    print(result)
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userSensorsActual(request):
    user = request.user
    sensors = Sensor.objects.filter(device__user=user)
    serializer = SensorWithActualDataSerializer(sensors, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def updateSensorsGroup(request):
    user = request.user
    serializer = SensorGroupUpdateSerializer(data=request.data, many=True)
    if serializer.is_valid():
        results = []
        for item in serializer.validated_data:
            try:
                sensor = Sensor.objects.get(id=item['id'], device__user=user)
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
@permission_classes([IsAuthenticated])
def getDevices(request):
    user = request.user
    devices = Device.objects.filter(user=user)
    serializer = DeviceSerializer(devices, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def devices(request):
    if request.method == "GET":
        user = request.user
        devices = Device.objects.filter(user__username=user)
        available_measurement_groups = MeasurementsGroup.objects.filter(
            mg_sensors__isnull=True,
            user=user)

        all_measurement_groups = MeasurementsGroup.objects.filter(
            user=user
        )

        return Response({
            "devices": DeviceSerializer(devices, many=True).data,
            "available_measurement_groups": MeasurementGroupSerializer(available_measurement_groups, many=True).data,
            "all_measurement_groups": MeasurementGroupSerializer(all_measurement_groups, many=True).data,
        })
    elif request.method == "PUT":
        user = request.user
        all_devices = Device.objects.filter(
            user=user
        )

        devices_from_api = [device.get("id")
                            for device in request.data]

        for device in all_devices:
            if device.id not in devices_from_api:
                print(f"Deleted id: {device.id}" + str(device.id))
                device.delete()
        return Response({"status": "OK"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteDevices(request):
    user = request.user
    all_devices = Device.objects.filter(
        user=user
    )

    devices_from_api = [device.get("id")
                        for device in request.data]

    for device in all_devices:
        if device.id not in devices_from_api:
            print(f"Deleted id: {device.id}" + str(device.id))
            device.delete()

    return Response({"errors:'OK'"}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getAddDeviceToken(request):
    user = request.user
    token_validity_min = 1

    # usuwanie starych tokenow
    AddDeviceToken.objects.filter(expires_at__lt=timezone.now()).delete()

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


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def deviceConfig(request, deviceId):

    if request.method == "GET":
        user = request.user
        device = Device.objects.get(
            user=user,
            id=deviceId)
        available_measurement_groups = MeasurementsGroup.objects.filter(
            mg_sensors__isnull=True,
            user__username=user)

        return Response({
            "device": DeviceSerializer(device).data,
            "available_measurement_groups": MeasurementGroupSerializer(available_measurement_groups, many=True).data,
        })

    elif request.method == "PATCH":
        if not deviceId:
            return Response({"error": "Device id not provided"}, status=400)

        try:
            device = Device.objects.get(id=deviceId)
        except Device.DoesNotExist:
            return Response({"error": "Device not found"}, status=404)

        serializer = DeviceUpdateSerializer(
            device, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)

        return Response(serializer.errors, status=400)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def measureGroups(request):
    if request.method == "GET":
        user = request.user

        groups = MeasurementsGroup.objects.filter(
            user=user
        )

        serializer = MeasurementGroupSerializer(groups, many=True)
        return Response(serializer.data,)

    elif request.method == "PATCH":
        user = request.user

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
