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

def fetch_logs(date_range=None,page_predicate=None,page_direction=None):
    query = "AppEvents"
    projection = " | top 10 by TimeGenerated desc"

    try:
        if date_range == None:
            timespan=None
        else:
            timespan = tuple([datetime(*date_range[0],hour=0,minute=0,second=0),datetime(*date_range[1],hour=23,minute=59,second=59)])
            print(PAGINATION_FILTER,PAGINATION_DIRECTION)
            paginationClause= "PAGINATION_FILTER.format(PAGINATION_DIRECTION[page_direction],page_predicate)"

        query += projection
        response = client.query_workspace(workspace_id=os.environ.get("LOGS_WORKSPACE_ID"),
                                          query=query,
                                          timespan=timespan)
        
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

