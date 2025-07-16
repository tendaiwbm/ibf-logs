from django.http import JsonResponse
from pandas import DataFrame


def extract_resource_name(route):
    return route.replace("api/visits/","").replace("/","")

def response_formatter(endpoint):
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
