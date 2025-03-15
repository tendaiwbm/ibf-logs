import seaborn as sb
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
from interface import query_executor

TODAY = datetime.today().strftime('%Y-%m-%d')

def sort_interactions(depth,old_list,new_list):
    if depth == 0:
        return


def weekly_interactions():
    query = """SELECT * FROM dashboard_weekly_interactions"""
    interactions = query_executor(query)
    


if __name__ == "__main__":
    weekly_interactions()
