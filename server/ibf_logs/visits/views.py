from json import loads
from django.http import JsonResponse
from django.conf import settings
from utils.logs import fetch_logs


def visits(request):
    dateRange = tuple([int(datePart) for datePart in date.split("-")] for date in tuple(request.GET.values()))
    logsDF = fetch_logs(*dateRange)
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    return JsonResponse(logsDF.to_dict(orient="index"))
