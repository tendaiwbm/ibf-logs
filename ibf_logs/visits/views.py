from django.shortcuts import render
from django.http import JsonResponse

def visits(request):
    return JsonResponse({i: i+1 for i in range(100)})
