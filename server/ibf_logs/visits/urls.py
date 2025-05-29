from django.urls import path
from .views import visits,get_page,get_unique_column_values

urlpatterns = [path("",visits),
               path("page/",get_page),
               path("unique-values",get_unique_column_values),]
