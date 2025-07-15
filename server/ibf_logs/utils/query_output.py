from pandas import DataFrame
from azure.core.exceptions import HttpResponseError
from table_mappings import ViewColumns


def query_output_inspector(query_executor):
    def wrapper(arg1,arg2):
        queryResult = query_executor(arg1,arg2)
        if isinstance(queryResult,DataFrame):
            if len(queryResult) > 0:
                if len(queryResult.keys()) > 1:
                    return queryResult[ViewColumns]
                return queryResult
            else:
                return {"num_records": 0}
        elif isinstance(queryResult,HttpResponsError):
            return {"error": "data connection failed."}
    return wrapper
