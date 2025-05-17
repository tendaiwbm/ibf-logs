from json import loads
from django.http import JsonResponse
from django.conf import settings

from utils.data_validation import parse_date
from utils.logs import fetch_logs


def visits(request):
    dateInterval = parse_date(request.GET["date"])
    logsDF = fetch_logs(dateInterval)
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]

    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)

def get_page(request):
    dateInterval = parse_date(request.GET["date"])
    logsDF = fetch_logs(dateInterval)
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]

    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }

    return JsonResponse(RESPONSE)
