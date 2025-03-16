from numpy import array,arange
import matplotlib.pyplot as plt
from datetime import datetime
from interface import query_executor

TODAY = datetime.today().strftime('%Y-%m-%d')
OUTPUT_DIR = "../views/images/"


def recursive_backwards_sort(interval,current_interval,interactions,new_list):
    if interval == current_interval:
        return 0
    
    idx = recursive_backwards_sort(interval-1,current_interval,interactions,new_list)
    if interval in interactions:
        new_list[idx] = tuple([interval,interactions[interval]])
    return idx+1
    
def recursive_forward_sort(interval,interactions,new_list):
    if interval == 0:
        return new_list.index(0)
    
    idx = recursive_forward_sort(interval-1,interactions,new_list)
    if interval in interactions:
        new_list[idx] = tuple([interval,interactions[interval]])
    return idx+1

def plot(title,x,y,x_label,x_pad,y_label,y_pad,file_name):
    x = [str(interval) for interval in x]
    plt.plot(x,y,color="r",marker="o",markersize=4,linestyle="--")
    plt.xlabel(x_label,labelpad=x_pad)
    plt.ylabel(y_label,labelpad=y_pad)
    plt.title(title,pad=13)
    plt.savefig("".join([OUTPUT_DIR,file_name]),dpi=250)
    plt.clf()
    return True

def find_split_index(iterable,element):
    return iterable.index(element)

def weekly_interactions():
    currentWeekQuery = f"""SELECT EXTRACT('week' from '{TODAY}'::DATE)::INTEGER"""
    currentWeek = query_executor(currentWeekQuery)[0][0]
    query = """SELECT * FROM dashboard_weekly_interactions"""
    interactions = query_executor(query)
    interactionsDict = {interaction[1]: interaction[0] for interaction in interactions}
    sortedInteractions = [0]*52
    recursive_backwards_sort(52,currentWeek,interactionsDict,sortedInteractions)
    splitIdx = find_split_index(sortedInteractions,(46,182))
    sortedInteractions = sortedInteractions[splitIdx:] + [0]*splitIdx
    recursive_forward_sort(currentWeek,interactionsDict,sortedInteractions)
    splitIdx = find_split_index(sortedInteractions,0)
    sortedInteractions = array(sortedInteractions[:splitIdx])
    
    x = sortedInteractions[:,0]
    y = sortedInteractions[:,1]
    plot("IBF Dashboard Interactions per Week",x,y,"Week Number",9,"Number of Interactions",11,"weekly_interactions_test.png")

def monthly_interactions():
    currentMonthQuery = f"""SELECT EXTRACT('month' from '{TODAY}'::DATE)::INTEGER"""
    currentMonth = query_executor(currentMonthQuery)[0][0]
    query = """SELECT * FROM dashboard_monthly_interactions"""
    interactions = query_executor(query)
    interactionsDict = {interaction[1]: interaction[0] for interaction in interactions}
    sortedInteractions = [0]*12
    recursive_backwards_sort(12,currentMonth,interactionsDict,sortedInteractions)
    splitIdx = find_split_index(sortedInteractions,(11,427))
    sortedInteractions = sortedInteractions[splitIdx:] + [0]*splitIdx
    recursive_forward_sort(currentMonth,interactionsDict,sortedInteractions)
    splitIdx = find_split_index(sortedInteractions,0)
    sortedInteractions = array(sortedInteractions[:splitIdx])
    
    x = sortedInteractions[:,0]
    y = sortedInteractions[:,1]
    plot("IBF Dashboard Interactions per Month",x,y,"Month Number",9,"Number of Interactions",11,"monthly_interactions.png")

if __name__ == "__main__":
    weekly_interactions()
    monthly_interactions()
