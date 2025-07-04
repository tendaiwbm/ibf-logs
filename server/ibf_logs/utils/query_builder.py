class Query(str):
    def __new__(cls,builder):
        return super().__new__(cls," | ".join(builder.orderedParts))

class QueryBuilder():
    def __init__(self):
        self.tableName = "AppEvents"
        self.orderedParts = [self.tableName]
    
    def add_sort_clause(self,sort_params=None):
        if isinstance(sort_params,type(None)):
            sort_params = "TimeGenerated desc"
        elif isinstance(sort_params,list):
            sort_params = ", ".join(sort_params)

        assert sort_params is not None

        querySort = "order by {} ".format(sort_params)
        self.orderedParts.append(querySort)
        
        return self

    def add_distinct_clause(self,column):
        queryDistinct = f"distinct {column}"
        self.orderedParts.append(queryDistinct)
        return self

    def add_filter_clause(self,filter_params):
        if bool(filter_params):
            queryFilter = "where {}".format(" and ".join(["{} in {}".format(k,v) for k,v in filter_params.items()]))
            self.orderedParts.append(queryFilter)
        return self

    def add_cursor_clause(self,direction,predicate):
        queryPage = "where TimeGenerated {} todatetime('{}')".format(direction,predicate)
        self.orderedParts.append(queryPage)
        return self

    def add_limit_clause(self,count=10):
        queryLimit = f"take {count}"
        self.orderedParts.append(queryLimit)
        return self

    def add_offset_clause(self,direction,predicate):
        queryPage = "where {}"
        rowVariable = "row_"

        if direction == "<":
           queryPage = queryPage.format(" >= ".join([rowVariable,f"{int(predicate) * 10}"]))
        else:
            pageLowerBound = " >= ".join([rowVariable,f"{(int(predicate) - 2) * 10}"])
            pageUpperBound = " < ".join([rowVariable,f"{(int(predicate) - 1) * 10}"])
            queryPage = queryPage.format(" and ".join([pageLowerBound,pageUpperBound])) 

        for sub_clause in ["serialize","extend row_ = row_number(0)",queryPage]:
            self.orderedParts.append(sub_clause)
       
        return self
        
    def build(self):
        return Query(self)

class QueryOrchestrator:
    def __init__(self,builder):
        self.builder = builder

    def build_generic_query(self):
        return self.builder.add_sort_clause().build()

    def build_unique_column_values_query(self,column):
        return self.builder.add_distinct_clause(column).build()

    def build_filtered_view_query(self,filter_params):
        return self.builder.add_filter_clause(filter_params).add_sort_clause().build()
    
    def build_sorted_view_query(self,filter_params,sort_params):
        return self.builder.add_filter_clause(filter_params).add_sort_clause(sort_params).build()
    
    def build_filtered_page_query(self,filter_params,direction,predicate):
        self.builder.add_filter_clause(filter_params).add_cursor_clause(direction,predicate)

        if direction == "<":
            self.builder.add_sort_clause()
        else:
            self.builder.add_sort_clause("TimeGenerated asc")
    
        self.builder.add_limit_clause()
        
        if direction == ">":
            self.builder.add_sort_clause()

        return self.builder.build()

    def build_sorted_page_query(self,filter_params,sort_params,direction,predicate):
        return self.builder.add_filter_clause(filter_params).add_sort_clause(sort_params).add_offset_clause(direction,predicate).build()

















