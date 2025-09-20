from django.http import JsonResponse
from pandas import DataFrame


def extract_resource_name(route):
    return route.replace("api/visits/","").replace("/","")

def table_response_formatter(endpoint):
    def format_response(request):
        responseValue = endpoint(request)
        if isinstance(responseValue,DataFrame):
        
            if extract_resource_name(request.path) != "unique-values":
                return JsonResponse({
                                     "columns": list(responseValue.columns),
                                     "rows": responseValue.values.tolist()
                                    })
            
            else:
                column = list(responseValue.columns)[0]
                return JsonResponse({
                                     "column": column,
                                     "values": responseValue[column].values.tolist()
                                    })
        
        elif isinstance(responseValue,dict):
            return JsonResponse(responseValue)

    return format_response

def graph_response_formatter(endpoint):
    def format_response(request):
        response = endpoint(request)
        formattedResponse = {
                             "data": response,
                             "target": extract_resource_name(request.path)
                            }
        return JsonResponse(formattedResponse)
    return format_response
