import os
from datetime import datetime,timezone

from azure.core.exceptions import HttpResponseError
from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient, LogsQueryStatus, LogsBatchQuery
import pandas as pd

from constants import PAGINATION_FILTER, PAGINATION_DIRECTION

credential = DefaultAzureCredential()
client = LogsQueryClient(credential)

"""
SWITCH TO DATASET class
"""

def fetch_logs(date_interval,page_predicate=None,page_direction=None):
    query = "AppEvents"

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

        return df
    
    except HttpResponseError:
        raise HttpResponseError

