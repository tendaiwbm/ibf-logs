from django.urls import path
from .views import visits,get_page

urlpatterns = [path("",visits),
               path("page/",get_page)]
