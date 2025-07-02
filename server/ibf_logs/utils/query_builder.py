TABLE_NAME = "AppEvents"

PAGINATION_FILTER = " where TimeGenerated {} todatetime('{}')"

DISTINCT = " distinct {}"

SINGLE_PROJECTION = " where {} == '{}'"

MULTI_PROJECTION = " where {} in {}"

WHERE = " where {}"

PAGINATION_DIRECTION = {
                        "left": "<",
                        "right": ">"
                       }

PAGE_PROJECTION = " top {} by {} {}"

ORDER_BY = " sort by {} {}"

SORT_BY = " order by {}"

DEFAULT_ORDERING_COLUMN = "TimeGenerated"

SORT_DESC = "desc"

SORT_ASC = "asc"

LIMIT = " take {}"

FORMAT_QUERY = " |".join

class Query(str):
    def __init__(self,builder):
        self.value = " | ".join(builder.orderedParts) 

class QueryBuilder():
    def __init__(self):
        self.tableName = "AppEvents"
        self.defaultOrderingColumn = "TimeGenerated"
        self.defaultOrder = "desc"
        self.querySort = ""
        self.queryFilter = ""
        self.distinctClause = ""
        self.orderedParts = []
    
    def add_sort_clause(self,sort_params=None):
        if isinstance(sort_params,type(None)):
            sort_params = "TimeGenerated desc"
        elif isinstance(sort_params,list):
            sort_params = ", ".join(sort_params)

        assert sort_params is not None

        if not self.querySort:
            self.querySort = "order by {} ".format(sort_params)
        else:
            self.querySort = ", ".join([self.querySort,sortClause])

        return self

    def add_distinct_clause(self,column):
        if not self.distinctClause:
            self.distinctClause = f"distinct {column}"
        return self

    def add_select_clause(self,params):
        return self

    def add_filter_clause(self,filter_params):
        if bool(filter_params):
            if not self.queryFilter:
                self.queryFilter = "where {}".format(" and ".join(["{} in {}".format(k,v) for k,v in filter_params.items()]))
        return self

    def set_target(self,target_operation):
        self.target = target_operation
        return self

    def build(self):
        if not self.target:
            raise AttributeError("QueryBuilder requires a target operation.")
        
        if self.target == "visits":
            self.orderedParts = [self.tableName,self.querySort]
        elif self.target == "unique_column_values":
            self.orderedParts = [self.tableName,self.distinctClause]
        elif self.target == "filtered_view":
            self.orderedParts = [self.tableName,self.queryFilter,self.querySort]
        elif self.target == "sorted_view":
            self.orderedParts = [self.tableName,self.queryFilter,self.querySort]
            if not self.queryFilter:
                del self.orderedParts[1]

        return Query(self)

class QueryOrchestrator:
    def __init__(self,builder):
        self.builder = builder

    def build_pagination_query(self):
        return self.builder.set_pagination_query_object_parts_then.build()

    def build_generic_query(self):
        return self.builder.set_target("visits")
                           .add_sort_clause()
                           .build()

    def build_unique_column_values_query(self,column):
        return self.builder.set_target("unique_column_values")
                           .add_distinct_clause(column)
                           .build()

    def build_filtered_view_query(self,filter_params):
        return self.builder.set_target("filtered_view")
                           .add_filter_clause(filter_params)
                           .add_sort_clause()
                           .build()
    
    def build_sorted_view_query(self,filter_params,sort_params):
        return self.builder.set_target("sorted_view")
                           .add_filter_clause(filter_params)
                           .add_sort_clause(sort_params)
                           .build()
    


















