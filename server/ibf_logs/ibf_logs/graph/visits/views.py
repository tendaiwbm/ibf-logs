from datetime import datetime

from django.http import JsonResponse
from django.conf import settings
from numpy import array, arange
import pandas as pd

from ...utils.data_validation import parse_date, parse_column_name, parse_filter_values, parse_sort_values, parse_direction
from ...utils.logs import query_logs_table
from ...utils.query_builder import QueryBuilder,QueryOrchestrator
from ...utils.response import nested_intervals_as_dict
from .response import graph_response_formatter


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
    return nested_intervals_as_dict(df,"week","week_number")

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
    return nested_intervals_as_dict(df,"month","month")

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
    return nested_intervals_as_dict(df,"week","week_number")

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
    return nested_intervals_as_dict(df,"month","month")

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
   
    return {"values": list(df["avg_duration"]),
            "min": min(df["avg_duration"]),
            "max": max(df["avg_duration"]),
            "units": "minutes"}





