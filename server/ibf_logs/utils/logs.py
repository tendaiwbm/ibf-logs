import os
from datetime import datetime,timezone

from azure.core.exceptions import HttpResponseError
from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient, LogsQueryStatus, LogsBatchQuery
import pandas as pd

credential = DefaultAzureCredential()
client = LogsQueryClient(credential)


def fetch_logs(date_interval,query):
    try:
        response = client.query_workspace(workspace_id=os.environ.get("LOGS_WORKSPACE_ID"),
                                          query=query,
                                          timespan=date_interval)
        
        if response.status == LogsQueryStatus.success:
            data = response.tables
        else:
            error = response.partial_error
            data = response.partial_data
        
        for table in data:
            df = pd.DataFrame(data=table.rows, columns=table.columns)

        if len(df) > 0:
            return df
        else:
            return "Zero records returned"
    
    except HttpResponseError:
        raise HttpResponseError

def fetch_unique_column_values(query):
    try:
        response = client.query_workspace(workspace_id=os.environ.get("LOGS_WORKSPACE_ID"),
                                          query=query,
                                          timespan=None)
        
        if response.status == LogsQueryStatus.success:
            data = response.tables
        else:
            error = response.partial_error
            data = response.partial_data
        
        for table in data:
            df = pd.DataFrame(data=table.rows, columns=table.columns)

    except HttpResponseError:
        raise HttpResponseError

