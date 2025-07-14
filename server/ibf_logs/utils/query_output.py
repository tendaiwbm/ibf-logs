from pandas import DataFrame
from azure.core.exceptions import HttpResponseError


def query_output_inspector(query_executor):
    def wrapper(arg1,arg2):
        queryResult = query_executor(arg1,arg2)
        if isinstance(queryResult,DataFrame):
            if len(queryResult) > 0:
                return queryResult
            else:
                return {"num_records": 0}
        elif isinstance(queryResult,HttpResponsError):
            return {"error": "data connection failed."}
    return wrapper
