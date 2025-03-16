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

def find_split_index(iterable,element):
    return iterable.index(element)

def plot(title,x,y,x_label,x_pad,y_label,y_pad,file_name):
    x = [str(interval) for interval in x]
    plt.plot(x,y,color="r",marker="o",markersize=4,linestyle="--")
    plt.xlabel(x_label,labelpad=x_pad)
    plt.ylabel(y_label,labelpad=y_pad)
    plt.title(title,pad=13)
    plt.savefig("".join([OUTPUT_DIR,file_name]),dpi=250)
    plt.show()
    plt.clf()
    return True

def interactions(interval_name,interval_range_max,seed,plot_title,x_label,x_label_padding,y_label,y_label_padding,output_file_name):
    currentIntervalQuery = f"""SELECT EXTRACT('{interval_name}' from '{TODAY}'::DATE)::INTEGER"""
    currentInterval = query_executor(currentIntervalQuery)[0][0]
    query = f"""SELECT * FROM dashboard_{interval_name}ly_interactions"""
    interactions = query_executor(query)
    
    interactionsDict = {interaction[1]: interaction[0] for interaction in interactions}
    sortedInteractions = [0]*interval_range_max
    recursive_backwards_sort(interval_range_max,currentInterval,interactionsDict,sortedInteractions)
    splitIdx = find_split_index(sortedInteractions,seed)
    sortedInteractions = sortedInteractions[splitIdx:] + [0]*splitIdx
    recursive_forward_sort(currentInterval,interactionsDict,sortedInteractions)
    splitIdx = find_split_index(sortedInteractions,0)
    sortedInteractions = array(sortedInteractions[:splitIdx])
    
    x = sortedInteractions[:,0]
    y = sortedInteractions[:,1]
    plot(plot_title,x,y,x_label,x_label_padding,y_label,y_label_padding,output_file_name)

if __name__ == "__main__":
    weekParamDict = {
                        "interval_name": "week",
                        "interval_range_max": 52,
                        "seed": (46,182),
                        "plot_title": "IBF Dashboard Interactions per Week",
                        "x_label": "Week Number",
                        "x_label_padding": 9,
                        "y_label": "Number of Interactions",
                        "y_label_padding": 11,
                        "output_file_name": "weekly_interactions.png"
                    }
    monthParamDict = {
                        "interval_name": "month",
                        "interval_range_max": 12,
                        "seed": (11,427),
                        "plot_title": "IBF Dashboard Interactions per Month",
                        "x_label": "Month Number",
                        "x_label_padding": 9,
                        "y_label": "Number of Interactions",
                        "y_label_padding": 11,
                        "output_file_name": "monthly_interactions.png"
                    }
    
    interactions(**weekParamDict)
    interactions(**monthParamDict)
