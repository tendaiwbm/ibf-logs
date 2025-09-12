from datetime import datetime

from django.http import JsonResponse
from django.conf import settings
from numpy import array, arange
import pandas as pd

from utils.data_validation import parse_date, parse_column_name, parse_filter_values, parse_sort_values, parse_direction
from utils.logs import query_logs_table
from utils.query_builder import QueryBuilder,QueryOrchestrator
from .response import table_response_formatter, graph_response_formatter


@table_response_formatter
def visits(request):
    dateInterval = parse_date(request.GET["date"])
    queryBuilder = QueryBuilder()
    genericQuery = QueryOrchestrator(queryBuilder).build_generic_query()
    
    return query_logs_table(dateInterval,genericQuery)

@table_response_formatter
def unique_column_values(request):
    columnName = parse_column_name(request.GET["column"])
    dateInterval = parse_date(request.GET["date"])
    queryBuilder = QueryBuilder()
    uniqueColumnValuesQuery = QueryOrchestrator(queryBuilder).build_unique_column_values_query(columnName)

    return query_logs_table(dateInterval,uniqueColumnValuesQuery).replace({"": "(Blanks)"})

@table_response_formatter
def filtered_view(request):
    dateInterval = parse_date(request.GET["date"])
    filterDict = parse_filter_values(request.GET)
    
    if isinstance(filterDict,ValueError):
        return {"message": "Filter failed."}
    
    queryBuilder = QueryBuilder()
    filterQuery = QueryOrchestrator(queryBuilder).build_filtered_view_query(filterDict)

    return query_logs_table(dateInterval,filterQuery)

@table_response_formatter
def sorted_view(request):
    dateInterval = parse_date(request.GET["date"])
    filterDict = parse_filter_values(request.GET)
    sortParams = parse_sort_values(request.GET)
    
    queryBuilder = QueryBuilder()
    sortQuery = QueryOrchestrator(queryBuilder).build_sorted_view_query(filterDict,sortParams)

    return query_logs_table(dateInterval,sortQuery)

@table_response_formatter
def filtered_page(request):
    dateInterval = parse_date(request.GET["date"])
    direction = parse_direction(request.GET["dir"])
    if request.GET["filter"]:
        filterDict = parse_filter_values(request.GET)
    
    queryBuilder = QueryBuilder()
    filteredPageQuery = QueryOrchestrator(queryBuilder).build_filtered_page_query(filterDict,direction,request.GET["predicate"])
    
    return query_logs_table(dateInterval,filteredPageQuery)

@table_response_formatter
def sorted_page(request):
    dateInterval = parse_date(request.GET["date"])
    direction = parse_direction(request.GET["dir"])
    sortParams = parse_sort_values(request.GET)
    
    if request.GET["filter"]:
        filterDict = parse_filter_values(request.GET)
    
    queryBuilder = QueryBuilder()
    sortedPageQuery = QueryOrchestrator(queryBuilder).build_sorted_page_query(filterDict,sortParams,direction,request.GET["pageNumber"])
    
    return query_logs_table(dateInterval,sortedPageQuery)

@graph_response_formatter
def weekly_interactions(request):
    
    dateInterval = parse_date("null")
    extendFunction = "datetime_part('week_of_year',TimeGenerated)"
    extensionColumn = "week_number"
    aggFunction = "count() by week_number"
    aggColumn = "weekly_interactions"

    queryBuilder = QueryBuilder()
    weeklyInteractionsQuery = QueryOrchestrator(queryBuilder).build_weekly_interactions_query(extendFunction,extensionColumn,aggFunction,aggColumn)
    weeklyInteractions = query_logs_table(dateInterval,weeklyInteractionsQuery)
    #print(weeklyInteractions)

    return weeklyInteractions

    # sorting 
    # return sorted data
    # graph response formatter does something
     
    































