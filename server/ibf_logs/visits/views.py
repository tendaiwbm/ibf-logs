from json import loads
from django.http import JsonResponse
from django.conf import settings

from .table_mappings import ViewColumns, FilterColumns
from utils.data_validation import parse_date, parse_column_name, parse_filter_values, parse_sort_values, parse_direction
from utils.logs import query_logs_table
from utils.query_builder import QueryBuilder,QueryOrchestrator


def visits(request):
    dateInterval = parse_date(request.GET["date"])
    queryBuilder = QueryBuilder()
    genericQuery = QueryOrchestrator(queryBuilder).build_generic_query()
    
    logsDF = query_logs_table(dateInterval,genericQuery)[ViewColumns]
    if isinstance(logsDF,str):
        return JsonResponse({"error": "No matching records found."})

    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)

def unique_column_values(request):
    columnName = parse_column_name(request.GET["column"])
    dateInterval = parse_date(request.GET["date"])
    queryBuilder = QueryBuilder()
    uniqueColumnValuesQuery = QueryOrchestrator(queryBuilder).build_unique_column_values_query(columnName)

    uniqueValuesDF = query_logs_table(dateInterval,uniqueColumnValuesQuery)
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
    
    queryBuilder = QueryBuilder()
    filterQuery = QueryOrchestrator(queryBuilder).build_filtered_view_query(filterDict)

    logsDF = query_logs_table(dateInterval,filterQuery)
    
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
    
    queryBuilder = QueryBuilder()
    sortQuery = QueryOrchestrator(queryBuilder).build_sorted_view_query(filterDict,sortParams)

    logsDF = query_logs_table(dateInterval,sortQuery)
    if isinstance(logsDF,str):
        return JsonResponse({"message": "No records returned"})
    
    logsDF = logsDF[ViewColumns]
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
    
    queryBuilder = QueryBuilder()
    filteredPageQuery = QueryOrchestrator(queryBuilder).build_filtered_page_query(filterDict,direction,request.GET["predicate"])
    
    logsDF = query_logs_table(dateInterval,filteredPageQuery)[ViewColumns]
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }

    return JsonResponse(RESPONSE)

def sorted_page(request):
    dateInterval = parse_date(request.GET["date"])
    direction = parse_direction(request.GET["dir"])
    sortParams = parse_sort_values(request.GET)
    
    if request.GET["filter"]:
        filterDict = parse_filter_values(request.GET,FilterColumns)
    
    queryBuilder = QueryBuilder()
    sortedPageQuery = QueryOrchestrator(queryBuilder).build_sorted_page_query(filterDict,sortParams,direction,request.GET["pageNumber"])
    
    logsDF = query_logs_table(dateInterval,sortedPageQuery)[ViewColumns]
    logsDF["Properties"] = [loads(string) for string in logsDF["Properties"]]
    RESPONSE = {
                "columns": list(logsDF.columns),
                "rows": logsDF.values.tolist()
               }
    
    return JsonResponse(RESPONSE)









