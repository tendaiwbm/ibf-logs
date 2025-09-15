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

def find_split_index(iterable,element):
    return iterable.index(element)
