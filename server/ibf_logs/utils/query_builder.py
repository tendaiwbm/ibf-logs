TABLE_NAME = "AppEvents"

PAGINATION_FILTER = " where TimeGenerated {} todatetime('{}')"

DISTINCT = " distinct {}"

PAGINATION_DIRECTION = {
                        "left": "<",
                        "right": ">"
                       }

PAGE_PROJECTION = " top {} by {} {}"

ORDER_BY = " sort by {} {}"

DEFAULT_ORDERING_COLUMN = "TimeGenerated"

SORT_DESC = "desc"

SORT_ASC = "asc"

LIMIT = " take {}"

FORMAT_QUERY = " |".join

