import os
from datetime import datetime,timezone

from azure.core.exceptions import HttpResponseError
from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient, LogsQueryStatus
from pandas import DataFrame


credential = DefaultAzureCredential()
client = LogsQueryClient(credential)

def query_logs_table(date_interval,query):
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
            df = DataFrame(data=table.rows, columns=table.columns)

        if len(df) > 0:
            return df
        else:
            return "Zero records returned"
    
    except HttpResponseError:
        raise HttpResponseError

