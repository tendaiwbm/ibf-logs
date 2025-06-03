from json import loads
from django.http import JsonResponse
from django.conf import settings

from .table_mappings import ViewColumns
from utils.data_validation import parse_date, parse_column_name
from utils.logs import fetch_logs, fetch_unique_column_values
from utils.query_builder import (TABLE_NAME, ORDER_BY, DISTINCT,
                                 PAGINATION_FILTER, PAGINATION_DIRECTION, 
                                 DEFAULT_ORDERING_COLUMN, LIMIT,
                                 SORT_DESC, SORT_ASC, FORMAT_QUERY)


def visits(request):
    dateInterval = parse_date(request.GET["date"])

    orderByClause = ORDER_BY.format(DEFAULT_ORDERING_COLUMN,SORT_DESC)
    query = FORMAT_QUERY([TABLE_NAME,orderByClause])

    logsDF = fetch_logs(dateInterval,query)[ViewColumns]
    if isinstance(logsDF,str):
        return JsonResponse({"error": "No matching records found."})
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)

def get_page(request):
    dateInterval = parse_date(request.GET["date"])
    direction = request.GET["dir"] 
    
    selectionCondition = PAGINATION_FILTER.format(PAGINATION_DIRECTION[request.GET["dir"]],request.GET["predicate"])
    if direction == "left": orderByClause = ORDER_BY.format(DEFAULT_ORDERING_COLUMN,SORT_DESC)
    else:                   orderByClause = ORDER_BY.format(DEFAULT_ORDERING_COLUMN,SORT_ASC)
    limitClause = LIMIT.format(10) 
    newPageQuery = FORMAT_QUERY([TABLE_NAME,selectionCondition,orderByClause,limitClause])
    if direction == "right": newPageQuery = "| ".join([newPageQuery,ORDER_BY.format(DEFAULT_ORDERING_COLUMN,SORT_DESC)])
    
    logsDF = fetch_logs(dateInterval,newPageQuery)[ViewColumns]
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }

    return JsonResponse(RESPONSE)

def get_unique_column_values(request):
    columnName = parse_column_name(request.GET["column"])
    
    distinctClause = DISTINCT.format(columnName)
    selectDistinctQuery = FORMAT_QUERY([TABLE_NAME,distinctClause])

    uniqueValuesDF = fetch_unique_column_values(selectDistinctQuery)
    if columnName in ["ClientCity","ClientStateOrProvince"]:
        uniqueValuesDF[columnName].replace({"": "(Blanks)"}, inplace=True)
    
    RESPONSE = {
                "column": list(uniqueValuesDF.columns)[0],
                "values": uniqueValuesDF[columnName].values.tolist()
               }

    return JsonResponse(RESPONSE)



