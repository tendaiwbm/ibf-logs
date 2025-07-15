import os
from datetime import datetime,timezone

from azure.core.exceptions import HttpResponseError
from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient, LogsQueryStatus
from pandas import DataFrame
from query_output import query_output_inspector

credential = DefaultAzureCredential()
client = LogsQueryClient(credential)

@query_output_inspector
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

        return df
    
    except HttpResponseError:
        return HttpResponseError

