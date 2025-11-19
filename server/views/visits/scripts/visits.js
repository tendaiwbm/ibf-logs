import { request_weekly_interactions } from "./weekly_interactions/plot.js"
import { request_monthly_interactions } from "./monthly_interactions/plot.js"
import { request_weekly_users } from "./weekly_users/plot.js"
import { request_monthly_users } from "./monthly_users/plot.js"
import { request_avg_session_length } from "./average_session_length/plot.js"
import { View } from "../../shared/scripts/types/data.js"

const PageState = {
					"currentPage": 1,
					"dateRange": null,
					"numRecords": 0,
					"numPages": 0,
					"pageSize": 10,
					"previousPagePredicate": null,
					"nextPagePredicate": null
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


const UrlBuilderObject = {
						  "endpoint": "",
						  "query": {},
						  "sort": {}
						 };

const PageInstances = {
			  		    "view": null,
			  		    "table": null,
			  		    "urlBuilder": UrlBuilderObject,
			  		    "sortingHandler": null
					  };


(function main() {
    const view = new View();
    PageInstances["view"] = view;

    // const table = new Table(view.data);
    // PageInstances["table"] = table;
    request_weekly_interactions();
    request_monthly_interactions();
    request_weekly_users();
    request_monthly_users();
    request_avg_session_length();

})();
