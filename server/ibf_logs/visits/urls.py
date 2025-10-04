from django.urls import path
from .views import (visits,
                    filtered_page,
                    sorted_page,
                    unique_column_values,
                    filtered_view,
                    sorted_view,
                    weekly_interactions,
                    monthly_interactions,)
                    #ns_weekly_interactions)

urlpatterns = [path("",visits),
               path("filtered-page/",filtered_page),
               path("sorted-page/",sorted_page),
               path("unique-values/",unique_column_values),
               path("get-filtered-view/",filtered_view),
               path("sorted-view/",sorted_view),
               path("interactions-weekly/",weekly_interactions),
               path("interactions-monthly/",monthly_interactions),]
               #path("ns-interactions-weekly",ns_weekly_interactions),]
