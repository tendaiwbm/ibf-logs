from django.http import JsonResponse
from django.conf import settings
from utils.logs import fetch_logs


def visits(request):
    logsDF = fetch_logs(*tuple(request.GET.values()))
    return JsonResponse({i: i+1 for i in range(10)})
