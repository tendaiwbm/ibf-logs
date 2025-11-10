from datetime import datetime

from django.http import JsonResponse
from django.conf import settings
from numpy import array, arange
import pandas as pd

from ...utils.data_validation import parse_date, parse_column_name, parse_filter_values, parse_sort_values, parse_direction
from ...utils.logs import query_logs_table
from ...utils.query_builder import QueryBuilder,QueryOrchestrator
from .response import table_response_formatter, graph_response_formatter, response_formatter

@response_formatter
def visits(request):
    dateInterval = parse_date(request.GET["date"])
    queryBuilder = QueryBuilder()
    genericQuery = QueryOrchestrator(queryBuilder).build_generic_query()
    records = query_logs_table(dateInterval,genericQuery)
    
    return (len(records),records.head(10))

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
    
    # prepare query parameters
    dateInterval = parse_date("null")
    params = {
                "extend": [["year","datetime_part('year',TimeGenerated)"],
                           ["month","datetime_part('month',TimeGenerated)"],
                           ["week_no","datetime_part('week_of_year',TimeGenerated)"]],
                "update": ["week_number","iif(week_no == 1 and month == 12, 52, week_no)"],
                "agg": ["count","count() by year,week_number"],
                "nl": False
             }

    # build query & fetch data
    queryBuilder = QueryBuilder()
    interactionsQuery = QueryOrchestrator(queryBuilder).build_weekly_interactions_query(params)
    df = query_logs_table(dateInterval,interactionsQuery).set_index(["year","week_number"])
    
    # group week_number by year
    weekPerYear = {}
    for year in df.index.levels[0].values:
        yearDF = df.loc[year]
        weekRange = pd.Index(range(1,53))
        currentRange = yearDF.index
        extendedIndex = weekRange.difference(currentRange).set_names("week_number")
        extendedData = {"count": [0]*len(extendedIndex)}
        yearDF = pd.concat([yearDF,pd.DataFrame(index=extendedIndex,data=extendedData)]).sort_values(by=["week_number"])
        weekPerYear[int(year)] = [{"week_number": int(week_no), "count": int(num_interactions)} 
                                  for week_no,num_interactions in zip(yearDF.index.values,yearDF["count"])]

    return weekPerYear

@graph_response_formatter
def monthly_interactions(request):
    
    # prepare query parameters
    dateInterval = parse_date("null")
    params = {
                "extend": [["month","datetime_part('month',TimeGenerated)"],
                           ["year","datetime_part('year',TimeGenerated)"]],
                "agg": ["count","count() by year,month"],
                "nl": False
             }

    # build query & fetch data
    queryBuilder = QueryBuilder()
    interactionsQuery = QueryOrchestrator(queryBuilder).build_monthly_interactions_query(params)
    df = query_logs_table(dateInterval,interactionsQuery).set_index(["year","month"])
    
    # group month by year
    monthPerYear = {}
    for year in df.index.levels[0].values:
        yearDF = df.loc[year]
        monthRange = pd.Index(range(1,13))
        currentRange = yearDF.index
        extendedIndex = monthRange.difference(currentRange).set_names("month")
        extendedData = {"count": [0]*len(extendedIndex)}
        yearDF = pd.concat([yearDF,pd.DataFrame(index=extendedIndex,data=extendedData)]).sort_values(by=["month"])
        monthPerYear[int(year)] = [{"month": int(month), "count": int(num_interactions)} 
                                   for month,num_interactions in zip(yearDF.index.values,yearDF["count"])]

    return monthPerYear

@graph_response_formatter
def nunique_weekly_users(request):
    
    # prepare query parameters
    dateInterval = parse_date("null")
    params = {
                "extend": [["year","datetime_part('year',TimeGenerated)"],
                           ["month","datetime_part('month',TimeGenerated)"],
                           ["week_no","datetime_part('week_of_year',TimeGenerated)"]],
                "update": ["week_number","iif(week_no == 1 and month == 12, 52, week_no)"],
                "agg": ["count","count_distinct(UserId) by year,week_number"],
                "nl": False
             }

    # build query & fetch data
    queryBuilder = QueryBuilder()
    interactionsQuery = QueryOrchestrator(queryBuilder).build_nunique_weekly_users_query(params)
    df = query_logs_table(dateInterval,interactionsQuery).set_index(["year","week_number"])

    # group week_number by year
    weekPerYear = {}
    for year in df.index.levels[0].values:
        yearDF = df.loc[year]
        weekRange = pd.Index(range(1,53))
        currentRange = yearDF.index
        extendedIndex = weekRange.difference(currentRange).set_names("week_number")
        extendedData = {"count": [0]*len(extendedIndex)}
        yearDF = pd.concat([yearDF,pd.DataFrame(index=extendedIndex,data=extendedData)]).sort_values(by=["week_number"])
        weekPerYear[int(year)] = [{"week_number": int(week_no), "count": int(num_interactions)} 
                                  for week_no,num_interactions in zip(yearDF.index.values,yearDF["count"])]

    return weekPerYear

@graph_response_formatter
def nunique_monthly_users(request):
    
    # prepare query parameters
    dateInterval = parse_date("null")
    params = {
                "extend": [["month","datetime_part('month',TimeGenerated)"],
                           ["year","datetime_part('year',TimeGenerated)"]],
                "agg": ["count","count_distinct(UserId) by year,month"],
                "nl": False
             }

    # build query & fetch data
    queryBuilder = QueryBuilder()
    interactionsQuery = QueryOrchestrator(queryBuilder).build_nunique_monthly_users_query(params)
    df = query_logs_table(dateInterval,interactionsQuery).set_index(["year","month"])
    
    # group month by year
    monthPerYear = {}
    for year in df.index.levels[0].values:
        yearDF = df.loc[year]
        monthRange = pd.Index(range(1,13))
        currentRange = yearDF.index
        extendedIndex = monthRange.difference(currentRange).set_names("month")
        extendedData = {"count": [0]*len(extendedIndex)}
        yearDF = pd.concat([yearDF,pd.DataFrame(index=extendedIndex,data=extendedData)]).sort_values(by=["month"])
        monthPerYear[int(year)] = [{"month": int(month), "count": int(num_interactions)} 
                                   for month,num_interactions in zip(yearDF.index.values,yearDF["count"])]

    return monthPerYear

@graph_response_formatter
def avg_session_length(request):
    
    # prepare query parameters
    dateInterval = parse_date("null")
    params = {
                "extend": [["msec","toint((format_timespan(average_session_length, 'fff')))"],
                           ["seconds","toint((format_timespan(average_session_length, 'ss')))"],
                           ["minutes","toint((format_timespan(average_session_length, 'mm')))"],
                           ["hours","toint((format_timespan(average_session_length, 'hh')))"],
                           ["avg_duration","round((hours * 60) + minutes + (msec / 1000) + (seconds/60))"]],
                "agg": [["session_length", "max(TimeGenerated) - min(TimeGenerated) by UserId, SessionId"],
                        ["average_session_length","avg(session_length) by UserId"]],
                "project": ["TimeGenerated","UserId","SessionId"],
                "output": ["avg_duration"],
                "nl": False
             }
    
    # build query & fetch data
    queryBuilder = QueryBuilder()
    query = QueryOrchestrator(queryBuilder).build_avg_session_length_query(params)
    df = query_logs_table(dateInterval,query)
   
    return {"avg_duration": list(df["avg_duration"]),
            "min": min(df["avg_duration"]),
            "max": max(df["avg_duration"]),
            "units": "minutes"}





