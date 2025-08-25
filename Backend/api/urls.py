from django.urls import path
from .views import getData24h,userSensorsActual,updateSensorsGroup

urlpatterns = [
    path("devices/get-data-24h/<int:sensorId>", getData24h),
    path("devices/get-all-sensors", userSensorsActual),
    path("devices/update-sensors-group", updateSensorsGroup),
]
