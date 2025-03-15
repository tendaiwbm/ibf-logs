import seaborn as sb
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
from interface import query_executor

TODAY = datetime.today().strftime('%Y-%m-%d')

def recursive_backwards_sort(week,max_week_depth,interactions,new_list):
    if week == max_week_depth:
        return 0
    
    idx = recursive_backwards_sort(week-1,max_week_depth,interactions,new_list)
    if week in interactions:
        new_list[idx] = tuple([week,interactions[week]])
    return idx+1
    
def recursive_forward_sort(week,interactions,new_list):
    if week == 1:
        return new_list.index(0)
    
    idx = recursive_forward_sort(week-1,interactions,new_list)
    if week in interactions:
        new_list[idx] = tuple([week,interactions[week]])
    return idx+1


def weekly_interactions():
    currentWeekQuery = f"""SELECT EXTRACT('week' from '{TODAY}'::DATE)::INTEGER"""
    currentWeek = query_executor(currentWeekQuery)[0][0]
    query = """SELECT * FROM dashboard_weekly_interactions"""
    interactions = query_executor(query)
    interactionsDict = {interaction[1]: interaction[0] for interaction in interactions}
    sortedInteractions = [0]*len(interactions)
    recursive_backwards_sort(52,52-currentWeek,interactionsDict,sortedInteractions)
    sortedInteractions = sortedInteractions[4:] + [0]*4
    recursive_forward_sort(currentWeek,interactionsDict,sortedInteractions)
    sortedInteractions = sortedInteractions[:-1] 


if __name__ == "__main__":
    weekly_interactions()
