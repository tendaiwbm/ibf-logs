from django.urls import path
from .views import (
                     weekly_interactions,
                     monthly_interactions,
                     nunique_weekly_users,
                     nunique_monthly_users,
                     avg_session_length
                   )

urlpatterns = [
                path("interactions-weekly/",weekly_interactions),
                path("interactions-monthly/",monthly_interactions),
                path("users-weekly/",nunique_weekly_users),
                path("users-monthly/",nunique_monthly_users),
                path("avg-session-length/",avg_session_length),
              ]

