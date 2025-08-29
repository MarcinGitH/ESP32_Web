from django.urls import path
from .views import getData24h, userSensorsActual, updateSensorsGroup, getDevices,getAddDeviceToken,getSingleDevice

urlpatterns = [
    path("devices/get-data-24h/<int:measurements_group_id>", getData24h),
    path("devices/get-all-sensors", userSensorsActual),
    path("devices/update-sensors-group", updateSensorsGroup),
    path("devices/get-devices", getDevices),
    path("devices/get-add-device-token", getAddDeviceToken),
    path("devices/get-device-config/<int:deviceId>", getSingleDevice),
]
