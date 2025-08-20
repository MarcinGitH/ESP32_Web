from django.urls import path
from .views import user_devices

urlpatterns = [
    path("user/devices", user_devices),
]
