from django.urls import path
from .views import user_devices

urlpatterns = [
    path("devices/get-data-24h/<int:sensorId>", user_devices),
]
