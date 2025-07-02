from django.urls import path
from .views import (visits,
                    filtered_page,
                    get_sorted_page,
                    get_unique_column_values,
                    get_filtered_view,
                    sorted_view)

urlpatterns = [path("",visits),
               path("filtered-page/",filtered_page),
               path("sorted-page/",get_sorted_page),
               path("unique-values/",get_unique_column_values),
               path("get-filtered-view/",get_filtered_view),
               path("sorted-view/",sorted_view)]
