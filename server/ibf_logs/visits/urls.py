from django.urls import path
from .views import visits

urlpatterns = [path("",visits),]
