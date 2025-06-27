from datetime import datetime
from query_builder import SORT_ASC,SORT_DESC

def parse_date(date_interval):
    if date_interval == "null":
        dateInterval = None
    else:
        dateInterval = tuple([int(datePart) for datePart in date.split("-")] for date in tuple(date_interval.split(",")))
        dateInterval = tuple([datetime(*dateInterval[0],hour=0,minute=0,second=0),datetime(*dateInterval[1],hour=23,minute=59,second=59)])

    return dateInterval

def parse_column_name(column_name):
    columnMap = {
                 "Name": "Name",
                 "ClientOS": "ClientOS",
                 "ClientCity": "ClientCity",
                 "ClientType": "ClientType",
                 "ClientModel": "ClientModel",
                 "ClientBrowser": "ClientBrowser",
                 "ClientStateOrProvince": "ClientStateOrProvince",
                 "ClientCountryOrRegion": "ClientCountryOrRegion"
                }

    try:
        column_name = columnMap[column_name]
        return column_name
    except:
        return KeyError(f"Filter column '{column_name}' not recognised.")

def parse_filter_values(param_dict,filter_columns):
    filterDict = {}
    for k in param_dict:
        if k in filter_columns:
            try:
                assert(all(keyword not in param_dict[k] for keyword in ["delete","table"]))
                values = param_dict[k].split(",")
                if len(values) > 1:
                    filterDict[k] = str(tuple(values))
                else:
                    filterDict[k] = f"('{values[0]}')" 
            except:
                raise ValueError(f"Filter value '{param_dict[k]}' is an invalid predicate( set).")
    return filterDict

def parse_sort_values(param_dict):
    sortParams = [param.split("-") for param in param_dict["sort"].split(",")]
    sortParams = list(map(lambda param: f"{param[0]} {SORT_DESC}" if param[1] == "desc" else f"{param[0]} {SORT_ASC}",sortParams)) 
    if all("TimeGenerated" not in param for param in sortParams):
        sortParams.append(f"TimeGenerated {SORT_DESC}")
    
    return sortParams
    




















