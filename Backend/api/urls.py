from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("measure-groups/<int:measurements_group_id>/data-24h", getData24h),
    path("sensors", userSensorsActual),
    path("sensors/group", updateSensorsGroup),
    path("devices", devices),
    path("device-activation-token", getAddDeviceToken),
    path("devices/<int:deviceId>/config", deviceConfig),
    path("measure-groups", measureGroups),
    path("measure-groups/<int:selected_group>/data", getChartData),

    # user
    path("auth/register", UserRegistrationAPIView.as_view()),
    path("auth/login", UserLoginAPIView.as_view()),
    path("auth/logout", UserLogoutAPIView.as_view()),
    path("auth/token/refresh", TokenRefreshView.as_view()),
    path("auth/user", UserInfoAPIView.as_view()),


    
]

