from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("devices/get-data-24h/<int:measurements_group_id>", getData24h),
    path("devices/get-all-sensors", userSensorsActual),
    path("devices/update-sensors-group", updateSensorsGroup),
    path("devices/get-devices", getDeviceList),
    path("devices/get-add-device-token", getAddDeviceToken),
    path("devices/get-device-config/<int:deviceId>", getSingleDevice),
    path("devices/update-device-config", updateDeviceConfig),
    path("devices/update-measure-groups", updateMeasureGroups),
    path("devices/delete-devices", deleteDevices),

    # user
    path("register", UserRegistrationAPIView.as_view()),
    path("login", UserLoginAPIView.as_view()),
    path("logout", UserLogoutAPIView.as_view()),
    path("token/refresh", TokenRefreshView.as_view()),
    path("user", UserInfoAPIView.as_view()),
]
