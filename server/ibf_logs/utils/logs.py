import os
from datetime import datetime,timezone
from azure.core.exceptions import HttpResponseError
from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient, LogsQueryStatus, LogsBatchQuery
import pandas as pd

credential = DefaultAzureCredential()
client = LogsQueryClient(credential)

def fetch_logs(start=None,end=None):
    query = "AppEvents"
    try:
        response = client.query_workspace(workspace_id=os.environ.get("LOGS_WORKSPACE_ID"),query=query,timespan=(datetime(*start,tzinfo=timezone.utc),datetime(*end,tzinfo=timezone.utc)))
        if response.status == LogsQueryStatus.success:
            data = response.tables
        else:
            error = response.partial_error
            data = response.partial_data
        
        for table in data:
            df = pd.DataFrame(data=table.rows, columns=table.columns)

        return df
    
    except HttpResponseError:
        print(HttpResponseError)

