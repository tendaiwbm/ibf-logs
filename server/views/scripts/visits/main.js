// globals
const PageState = {
					"currentPage": 1,
					"dateRange": null,
					"numRecords": 0,
					"numPages": 0,
					"pageSize": 10,
					"previousPagePredicate": null,
					"nextPagePredicate": null
				   };

const DateRangeState = {
      		             "startDate": null,
            		     "endDate": null
                 		};

const PageInstances = {
			  		    "table": null
					  };

const PaginationButtonsState = { 
							 	 "next-page": true,
								 "previous-page": false
							   };

(function main() {
    const visits = new Visits();
}) ();
