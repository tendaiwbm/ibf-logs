from pandas import DataFrame,MultiIndex,Index,concat


def nested_intervals_as_dict(data,inner_interval,inner_interval_column):
    try:
        assert inner_interval in ["week","month"]
    except:
        raise AssertionError(f"Invalid interval '{inner_interval}'. Accepted values - ['week','month']")

    try:
        assert isinstance(data,DataFrame)
        assert isinstance(data.index,MultiIndex)
    except:
        raise AssertionError(f"Parameter 'data' should be of type '{type(DataFrame)}' and consist of a '{type(MultiIndex)}'.")
    
    if inner_interval == "week":
        innerIntervalRange = Index(range(1,53))
    else:
        innerIntervalRange = Index(range(1,13))
    
    intervalPerYear = {}
    for year in data.index.levels[0].values:
        yearDF = data.loc[year]
        currentRange = yearDF.index
        extendedIndex = innerIntervalRange.difference(currentRange).set_names(inner_interval_column)
        extendedData = {"count": [0]*len(extendedIndex)}
        yearDF = concat([yearDF,DataFrame(index=extendedIndex,data=extendedData)]).sort_values(by=[inner_interval_column])
        intervalPerYear[int(year)] = [{inner_interval_column: int(interval), "count": int(num_interactions)}
                                      for interval,num_interactions in zip(yearDF.index.values,yearDF["count"])]

    return intervalPerYear
