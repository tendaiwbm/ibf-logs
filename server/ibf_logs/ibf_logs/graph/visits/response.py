from django.http import JsonResponse
from pandas import DataFrame


def extract_resource_name(route):
    return route.replace("api/visits/","").replace("/","")

def graph_response_formatter(endpoint):
    def format_response(request):
        response = endpoint(request)
        formattedResponse = {
                             "data": response,
                             "target": extract_resource_name(request.path)
                            }
        return JsonResponse(formattedResponse)
    return format_response
