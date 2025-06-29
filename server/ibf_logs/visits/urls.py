from django.urls import path
from .views import (visits,
                    get_filtered_page,
                    get_sorted_page,
                    get_unique_column_values,
                    get_filtered_view,
                    get_sorted_view)

urlpatterns = [path("",visits),
               path("filtered-page/",get_filtered_page),
               path("sorted-page/",get_sorted_page),
               path("unique-values/",get_unique_column_values),
               path("get-filtered-view/",get_filtered_view),
               path("sorted-view/",get_sorted_view)]
