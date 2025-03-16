from numpy import array,arange
import matplotlib.pyplot as plt
from datetime import datetime
from interface import query_executor

TODAY = datetime.today().strftime('%Y-%m-%d')
OUTPUT_DIR = "../views/images/"


def recursive_backwards_sort(week,current_week,interactions,new_list):
    if week == current_week:
        return 0
    
    idx = recursive_backwards_sort(week-1,current_week,interactions,new_list)
    if week in interactions:
        new_list[idx] = tuple([week,interactions[week]])
    return idx+1
    
def recursive_forward_sort(week,interactions,new_list):
    if week == 0:
        return new_list.index(0)
    
    idx = recursive_forward_sort(week-1,interactions,new_list)
    if week in interactions:
        new_list[idx] = tuple([week,interactions[week]])
    return idx+1

def plot(title,x,y,x_label,x_pad,y_label,y_pad,file_name):
    plt.plot(x,y,color="r",marker="o",markersize=4,linestyle="--")
    plt.xlabel(x_label,labelpad=x_pad)
    plt.ylabel(y_label,labelpad=y_pad)
    plt.title(title,pad=13)
    plt.savefig("".join([OUTPUT_DIR,file_name]),dpi=250)
    plt.show()
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
    xticks = [str(week) for week in x]
    plot("IBF Dashboard Interactions per Week",xticks,y,"Week Number",9,"Number of Interactions",11,"weekly_interactions.png")

if __name__ == "__main__":
    weekly_interactions()
