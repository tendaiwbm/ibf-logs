from json import loads
from django.http import JsonResponse
from django.conf import settings

from utils.data_validation import parse_date
from utils.logs import fetch_logs
from utils.query_builder import TABLE_NAME, ORDER_BY, PAGINATION_FILTER, PAGINATION_DIRECTION, FORMAT_QUERY


def visits(request):
    dateInterval = parse_date(request.GET["date"]) 
    logsDF = fetch_logs(dateInterval,TABLE_NAME)
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]

    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)

def get_page(request):
    dateInterval = parse_date(request.GET["date"])
    
    selectionCondition = PAGINATION_FILTER.format(PAGINATION_DIRECTION[request.GET["dir"]],request.GET["predicate"])
    orderByClause = ORDER_BY.format("TimeGenerated","desc")
    newPageQuery = FORMAT_QUERY([TABLE_NAME,selectionCondition,orderByClause])
    
    logsDF = fetch_logs(dateInterval)
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]

    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }

    return JsonResponse(RESPONSE)
