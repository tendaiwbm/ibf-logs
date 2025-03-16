from numpy import array,arange
import matplotlib.pyplot as plt
from datetime import datetime
from interface import query_executor
from json import load
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

def traverse_from_end(i):
    return i-1

def traverse_from_start(i):
    return i+1

def find_split_index(iterable,idx,depth_function):
    idx = depth_function(idx)
    if iterable[idx] != 0:
        return idx

    idx = find_split_index(iterable,idx,depth_function)
    return idx

def plot(title,x,y,x_label,x_pad,y_label,y_pad,file_name,show=False):
    x = [str(interval) for interval in x]
    plt.plot(x,y,color="r",marker="o",markersize=4,linestyle="--")
    plt.xlabel(x_label,labelpad=x_pad)
    plt.ylabel(y_label,labelpad=y_pad)
    plt.title(title,pad=13)
    plt.savefig("".join([OUTPUT_DIR,file_name]),dpi=250)
    if show:
        plt.show()
    plt.clf()
    return True

def interactions(interval_name,interval_range_max,plot_title,x_label,x_label_padding,y_label,y_label_padding,output_file_name):
    currentIntervalQuery = f"""SELECT EXTRACT('{interval_name}' from '{TODAY}'::DATE)::INTEGER"""
    currentInterval = query_executor(currentIntervalQuery)[0][0]
    query = f"""SELECT * FROM dashboard_{interval_name}ly_interactions"""
    interactions = query_executor(query)
    
    interactionsDict = {interaction[1]: interaction[0] for interaction in interactions}
    sortedInteractions = [0]*interval_range_max
    recursive_backwards_sort(interval_range_max,currentInterval,interactionsDict,sortedInteractions)
    splitIdx = find_split_index(sortedInteractions,-1,traverse_from_start)
    sortedInteractions = sortedInteractions[splitIdx:] + [0]*splitIdx
    recursive_forward_sort(currentInterval,interactionsDict,sortedInteractions)
    splitIdx = find_split_index(sortedInteractions,-1,traverse_from_end)
    sortedInteractions = array(sortedInteractions[:splitIdx])

    x = sortedInteractions[:,0]
    y = sortedInteractions[:,1]
    plot(plot_title,x,y,x_label,x_label_padding,y_label,y_label_padding,output_file_name)

if __name__ == "__main__":
    with open("interactions.json","r") as params:
        parameters = load(params)
        for paramDict in parameters:
            interactions(**parameters[paramDict])
