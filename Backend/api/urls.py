from django.urls import path
from .views import getData24h, userSensorsActual, updateSensorsGroup, getDevices, getAddDeviceToken, getSingleDevice, updateDeviceConfig,getDeviceList,updateMeasureGroups

urlpatterns = [
    path("devices/get-data-24h/<int:measurements_group_id>", getData24h),
    path("devices/get-all-sensors", userSensorsActual),
    path("devices/update-sensors-group", updateSensorsGroup),
    path("devices/get-devices", getDeviceList),
    path("devices/get-add-device-token", getAddDeviceToken),
    path("devices/get-device-config/<int:deviceId>", getSingleDevice),
    path("devices/update-device-config", updateDeviceConfig),
    path("devices/update-measure-groups", updateMeasureGroups),
]
