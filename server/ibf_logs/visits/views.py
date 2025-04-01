from django.http import JsonResponse
from django.conf import settings
from utils.logs import fetch_logs


def visits(request):
    dateRange = tuple([int(datePart) for datePart in date.split("-")] for date in tuple(request.GET.values()))
    logsDF = fetch_logs(*dateRange)
    return JsonResponse({i: i+1 for i in range(10)})
