from json import loads
from django.http import JsonResponse
from django.conf import settings

from utils.data_validation import parse_date
from utils.logs import fetch_logs
from utils.query_builder import (TABLE_NAME, ORDER_BY, 
                                 PAGINATION_FILTER, PAGINATION_DIRECTION, 
                                 DEFAULT_ORDERING_COLUMN, LIMIT,
                                 SORT_DESC, SORT_ASC, FORMAT_QUERY)


def visits(request):
    dateInterval = parse_date(request.GET["date"])

    orderByClause = ORDER_BY.format(DEFAULT_ORDERING_COLUMN,SORT_DESC)
    query = FORMAT_QUERY([TABLE_NAME,orderByClause])
    logsDF = fetch_logs(dateInterval,query)

    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)

def get_page(request):
    dateInterval = parse_date(request.GET["date"])
    
    selectionCondition = PAGINATION_FILTER.format(PAGINATION_DIRECTION[request.GET["dir"]],request.GET["predicate"])
    if request.GET["dir"] == "left": orderByClause = ORDER_BY.format(DEFAULT_ORDERING_COLUMN,SORT_DESC)
    else:                            orderByClause = ORDER_BY.format(DEFAULT_ORDERING_COLUMN,SORT_ASC)
    limitClause = LIMIT.format(10) 
    newPageQuery = FORMAT_QUERY([TABLE_NAME,selectionCondition,orderByClause,limitClause])
    print(newPageQuery)
    logsDF = fetch_logs(dateInterval,newPageQuery)

    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }

    return JsonResponse(RESPONSE)
