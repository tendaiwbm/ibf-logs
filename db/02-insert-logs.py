from pandas import read_csv
from interface import query_executor
import json
from numpy import nan


def extract_properties(df):
    alterTableQuery = """ALTER TABLE logs """
    propertyNames = []
    for idx in df.index:
        properties = json.loads(df.loc[idx,"properties"])
        for key in properties:
            df.loc[idx,key] = properties[key]
            if key not in propertyNames:
                propertyNames.append(key)
                
    alterTableQuery = "".join([alterTableQuery,",".join([f"ADD COLUMN {key} VARCHAR" for key in propertyNames]),";"])

    return propertyNames,alterTableQuery

def alter_logs_columns(query):
    try:
        assert query_executor("SELECT COUNT(*) > 0 from information_schema.tables WHERE table_name = 'logs'","SELECT")
    except:
        raise AssertionError("Table 'logs' does not exist")
    query_executor(query,"ALTER")

def read_logs(columns):
    df = read_csv("/media/sf_shared/ade/ibf-logs.csv")
    df.rename(columns={col: col.lower() for col in df.columns},inplace=True)
    df.rename(columns={"timegenerated": "time_generated",
                       "operationname": "operation_name",
                       "operationid": "operation_id",
                       "sessionid": "session_id",
                       "userid": "user_id",
                       "clientcountryorregion": "client_country",
                       "clientbrowser": "client_browser",
                       "clientos": "client_os"},
                       inplace=True)
    
    properties,alterTableQuery = extract_properties(df)
    translate_country(df)
    alter_logs_columns(alterTableQuery)
    df = df[columns+properties].replace({nan: "NULL"})
    logs = {}
    for column in df.columns:
        logs[column] = list(df[column].values)
    
    return logs,len(df)

def translate_country(df):
    from translations import COUNTRY_MAP
    df.replace({"country": COUNTRY_MAP}, inplace=True)


def insert_logs(logsDict,count):
    columns = list(logsDict.keys())
    insertQuery = f"""INSERT INTO logs({",".join(columns)}) VALUES """
    
    for idx in range(count):
        row = [logsDict[col][idx] for col in columns]
        values = "".join(["(",",".join([f"'{value}'" if value != "NULL" else value for value in row]),")"])
        insertQuery = "".join([insertQuery,values])
        if idx == count - 1:
            query_executor(insertQuery,"INSERT")

        insertQuery = "".join([insertQuery,","])

def main():
    columns = ["time_generated","name","properties","operation_name","operation_id","session_id","user_id","client_country","client_browser","client_os"]
    insert_logs(*read_logs(columns))


if __name__ == "__main__":
    main()

