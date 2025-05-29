from datetime import datetime


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
