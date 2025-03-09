# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
"""
FILE: sample_logs_single_query.py
DESCRIPTION:
    This sample demonstrates authenticating the LogsQueryClient and querying a single query.
USAGE:
    python sample_logs_single_query.py
    Set the environment variables with your own values before running the sample:
    1) LOGS_WORKSPACE_ID - The first (primary) workspace ID.

This example uses DefaultAzureCredential, which requests a token from Azure Active Directory.
For more information on DefaultAzureCredential, see https://learn.microsoft.com/python/api/overview/azure/identity-readme?view=azure-python#defaultazurecredential.

**Note** - Although this example uses pandas to print the response, it's optional and
isn't a required package for querying. Alternatively, native Python can be used as well.
"""
# [START send_logs_query]
from datetime import timedelta
import os

from azure.core.exceptions import HttpResponseError
from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient, LogsQueryStatus, LogsBatchQuery
import pandas as pd


credential = DefaultAzureCredential()
client = LogsQueryClient(credential)

query = "AppEvents | take 5"
requests = [
            LogsBatchQuery(
                query="AppEvents",
                timespan=None,
                workspace_id=os.environ["LOGS_WORKSPACE_ID"],
            )]
'''
            LogsBatchQuery(query="bad query", timespan=timedelta(days=1), workspace_id=os.environ["LOGS_WORKSPACE_ID"]),
            LogsBatchQuery(
                query="""let Weight = 92233720368547758;
                range x from 1 to 3 step 1
                | summarize percentilesw(x, Weight * 100, 50)""",
                workspace_id=os.environ["LOGS_WORKSPACE_ID"],
                timespan=(datetime(2021, 6, 2, tzinfo=timezone.utc), datetime(2021, 6, 5, tzinfo=timezone.utc)), # (start, end)
                include_statistics=True,
            ),
]
'''
try:
    #response = client.query_workspace(os.environ["LOGS_WORKSPACE_ID"], query, timespan=timedelta(days=1))
    responses = client.query_batch(requests)
    for response in responses:
        if response.status == LogsQueryStatus.SUCCESS:
            data = response.tables
        else:
            # LogsQueryPartialResult - handle error here
            error = response.partial_error
            data = response.partial_data
            print(error)

        for table in data:
            df = pd.DataFrame(data=table.rows, columns=table.columns)
            df.to_csv("/media/sf_shared/ade/ibf-logs.csv",index=False)

except HttpResponseError as err:
    print("something fatal happened")
    print(err)

# [END send_logs_query]
"""
    TimeGenerated                                        _ResourceId          avgRequestDuration
0   2021-05-27T08:40:00Z  /subscriptions/faa080af-c1d8-40ad-9cce-e1a450c...  27.307699999999997
1   2021-05-27T08:50:00Z  /subscriptions/faa080af-c1d8-40ad-9cce-e1a450c...            18.11655
2   2021-05-27T09:00:00Z  /subscriptions/faa080af-c1d8-40ad-9cce-e1a450c...             24.5271
"""
