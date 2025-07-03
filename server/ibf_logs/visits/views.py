from json import loads
from django.http import JsonResponse
from django.conf import settings

from .table_mappings import ViewColumns, FilterColumns
from utils.data_validation import parse_date, parse_column_name, parse_filter_values, parse_sort_values, parse_direction
from utils.logs import fetch_logs, fetch_unique_column_values
from utils.query_builder import (TABLE_NAME,
                                 ORDER_BY,
                                 SORT_BY,
                                 DISTINCT,
                                 PAGINATION_FILTER, 
                                 PAGINATION_DIRECTION, 
                                 DEFAULT_ORDERING_COLUMN, 
                                 LIMIT,
                                 SORT_DESC, SORT_ASC, 
                                 FORMAT_QUERY,
                                 WHERE)
from utils.query_builder import QueryBuilder,QueryOrchestrator

def visits(request):
    dateInterval = parse_date(request.GET["date"])
    builder = QueryBuilder()
    query = QueryOrchestrator(builder).build_generic_query().value
    
    logsDF = fetch_logs(dateInterval,query)[ViewColumns]
    if isinstance(logsDF,str):
        return JsonResponse({"error": "No matching records found."})
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)

def filtered_page(request):
    dateInterval = parse_date(request.GET["date"])
    direction = parse_direction(request.GET["dir"])
    if request.GET["filter"]:
        filterDict = parse_filter_values(request.GET,FilterColumns)
    
    builder = QueryBuilder()
    newPageQuery = QueryOrchestrator(builder).build_filtered_page_query(filterDict,direction,request.GET["predicate"]).value
    logsDF = fetch_logs(dateInterval,newPageQuery)[ViewColumns]
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }

    return JsonResponse(RESPONSE)

def sorted_page(request):
    dateInterval = parse_date(request.GET["date"])
    direction = request.GET["dir"]
    sortParams = parse_sort_values(request.GET)
    
    if request.GET["filter"]:
        filterDict = parse_filter_values(request.GET,FilterColumns)
    
    selectionCondition = WHERE.format(" and ".join(["{} in {}".format(k,v) for k,v in filterDict.items()]))
    orderByClause = SORT_BY.format(", ".join(sortParams))
    offsetting = " | ".join([" serialize","extend row_ = row_number(0)"])
    limitClause = LIMIT.format(10)
    
    if direction == "left":
        paginationCondition = f" where row_ >= {int(request.GET['pageNumber']) * 10}"
    else:
        paginationCondition = f" where row_ >= {(int(request.GET['pageNumber']) - 2) * 10} and row_ < {(int(request.GET['pageNumber']) - 1) * 10}"


    if filterDict:
        newPageQuery = FORMAT_QUERY([TABLE_NAME,selectionCondition,orderByClause,offsetting,paginationCondition,limitClause])
    else:
        newPageQuery = FORMAT_QUERY([TABLE_NAME,orderByClause,offsetting,paginationCondition,limitClause])
    
    logsDF = fetch_logs(dateInterval,newPageQuery)[ViewColumns]
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)

def unique_column_values(request):
    columnName = parse_column_name(request.GET["column"])
    builder = QueryBuilder()
    selectDistinctQuery = QueryOrchestrator(builder).build_unique_column_values_query(columnName).value

    uniqueValuesDF = fetch_unique_column_values(selectDistinctQuery)
    uniqueValuesDF.replace({"": "(Blanks)"}, inplace=True)
    
    RESPONSE = {
                "column": list(uniqueValuesDF.columns)[0],
                "values": uniqueValuesDF[columnName].values.tolist()
               }

    return JsonResponse(RESPONSE)

def filtered_view(request):
    dateInterval = parse_date(request.GET["date"])
    filterDict = parse_filter_values(request.GET,FilterColumns)
    
    if isinstance(filterDict,ValueError):
        return JsonResponse({"message": "Filter failed."})
    
    builder = QueryBuilder()
    query = QueryOrchestrator(builder).build_filtered_view_query(filterDict).value

    logsDF = fetch_logs(dateInterval,query)
    
    if isinstance(logsDF,str):
        return JsonResponse({"message": "No records returned"})
    
    logsDF = logsDF[ViewColumns]
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)

def sorted_view(request):
    dateInterval = parse_date(request.GET["date"])
    filterDict = parse_filter_values(request.GET,FilterColumns)
    sortParams = parse_sort_values(request.GET)
    
    builder = QueryBuilder()
    sortQuery = QueryOrchestrator(builder).build_sorted_view_query(filterDict,sortParams).value

    logsDF = fetch_logs(dateInterval,sortQuery)
    if isinstance(logsDF,str):
        return JsonResponse({"message": "No records returned"})
    
    logsDF = logsDF[ViewColumns]
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)









