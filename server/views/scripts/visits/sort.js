class SortingHandler {
	constructor() {
		this.stateManager = { };
	}

	static update_state_manager(column) {
		var stateManager = PageInstances.sortingHandler.stateManager;
		if (stateManager.hasOwnProperty(column)) {
			if (stateManager[column] === "desc") {
				stateManager[column] = "asc";
			}
			else if (stateManager[column] === "asc") {
				stateManager[column] = "desc";
			}
			return;
		}
		stateManager[column] = "desc";
	}

	sorting_response_inspector(event,response,response_handler) {
		response_handler(event,response);
	}

	sort(event) {
		const sortingColumn = event.srcElement.innerText;
		SortingHandler.update_state_manager(sortingColumn);
		
		UrlBuilderObject["endpoint"] = "/get-sorted-view";
        UrlBuilderObject["query"]["date"] = PageState["dateRange"];
        updateUrlBuilderObject("sort");
        
        const sortURL = build_url(UrlBuilderObject);
        request(sortURL,SortingHandler.sorting_response_inspector,Table.show_sorted_view);
	} 

}