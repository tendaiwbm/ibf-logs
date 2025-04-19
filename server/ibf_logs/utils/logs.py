import os
from datetime import datetime,timezone
from azure.core.exceptions import HttpResponseError
from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient, LogsQueryStatus, LogsBatchQuery
import pandas as pd

credential = DefaultAzureCredential()
client = LogsQueryClient(credential)

def fetch_logs(date_range=None):
    query = "AppEvents | where TimeGenerated > '2025-04-01 23:59:59' | top 10 by TimeGenerated asc"
    try:
        if date_range is None:
            timespan=None
        else:
            timespan = tuple([datetime(*date_range[0],tzinfo=timezone.utc),datetime(*date_range[1],tzinfo=timezone.utc)])
       
        print(timespan)
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

        return df
    
    except HttpResponseError:
        print(HttpResponseError)

