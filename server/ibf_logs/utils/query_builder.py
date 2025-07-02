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
        self.value = " | ".join([builder.tableName,builder.querySort]) 

class QueryBuilder():
    def __init__(self):
        self.tableName = "AppEvents"
        self.defaultOrderingColumn = "TimeGenerated"
        self.defaultOrder = "desc"
        self.querySort = ""
        self.queryProjection = ""
        self.querySelect = ""
        self.queryFilter = ""
    
    def add_sort_clause(self,column="TimeGenerated",order="desc"):
        sortClause = f"{column} {order}"
        if not self.querySort:
            self.querySort = " ".join(["order by",sortClause])
        else:
            self.querySort = ", ".join([self.querySort,sortClause])
        return self

    def add_projection_clause(self,params):
        return self

    def add_select_clause(self,params):
        return self

    def add_filter_clause(self,params):
        return self

    def build(self):
        return Query(self)

class QueryOrchestrator:
    def __init__(self,builder):
        self.builder = builder

    def build_pagination_query(self):
        return self.builder.set_pagination_query_object_parts_then.build()

    def build_generic_query(self):
        return self.builder.add_sort_clause().build()























