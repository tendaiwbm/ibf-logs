from datetime import datetime
from pytz import timezone
from azure.core.exceptions import HttpResponseError
from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient, LogsQueryStatus, LogsBatchQuery
import pandas as pd
import os

credential = DefaultAzureCredential()
client = LogsQueryClient(credential)

def fetch_logs(start=None,end=None):
    requests = [LogsBatchQuery(query="AppEvents",
                               timespan=(datetime(2021, 6, 2, tzinfo=timezone("UTC")),datetime(2021, 6, 5, tzinfo=timezone("UTC"))),
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
        print(df)
        return df

    except HttpResponseError:
        print(HttpResponseError)

