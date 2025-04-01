import os
from datetime import datetime,timezone
from azure.core.exceptions import HttpResponseError
from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient, LogsQueryStatus, LogsBatchQuery
import pandas as pd

credential = DefaultAzureCredential()
client = LogsQueryClient(credential)

def fetch_logs(start=None,end=None):
    requests = [LogsBatchQuery(query="AppEvents",
                               timespan=(datetime(*start,tzinfo=timezone.utc),datetime(*end,tzinfo=timezone.utc)),
                               workspace_id=os.environ.get("LOGS_WORKSPACE_ID"))]
    try:
        responses = client.query_batch(requests)
        for response in responses:
            if response.status == LogsQueryStatus.SUCCESS:
                data = response.tables
            else:
                error = response.partial_error
                data = response.partial_data

            for table in data:
                df = pd.DataFrame(data=table.rows, columns=table.columns)
        return df

    except HttpResponseError:
        print(HttpResponseError)

