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

const PaginationButtonsState = { 
							 	 "next-page": true,
								 "previous-page": false
							   };

const FilterColumns = ["Name",
					   "ClientType",
					   "ClientModel",
					   "ClientOS",
					   "ClientCity",
					   "ClientStateOrProvince",
					   "ClientCountryOrRegion",
					   "ClientBrowser"];

const FilterState = {
					 "Name": [],
					 "ClientType": [],
					 "ClientModel": [],
					 "ClientOS": [],
					 "ClientCity": [],
					 "ClientStateOrProvince": [],
					 "ClientCountryOrRegion": [],
					 "ClientBrowser": [] 
					};

const UrlBuilderObject = {
						  "endpoint": "",
						  "query": {}
						 };

const PageInstances = {
			  		    "visits": null,
			  		    "table": null,
			  		    "urlBuilder": UrlBuilderObject
					  };

function main() {
    const visits = new Visits();
    PageInstances["visits"] = visits;
};

main();