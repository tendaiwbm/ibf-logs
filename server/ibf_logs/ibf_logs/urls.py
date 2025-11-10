from django.contrib import admin
from django.urls import path,include


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/graph/visits/",include("ibf_logs.graph.visits.urls")),
    path("api/table/",include("ibf_logs.table.urls")),
]
