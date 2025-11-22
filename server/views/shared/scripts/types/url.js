import { TableState } from "../state/table_state.js"


class URL {
	constructor(url_parts) {
		this.resource = url_parts.slice(0,2).join("/");
		this.queryString = url_parts.slice(2).join("&");
		this.url = [this.resource,this.queryString].join("?");
	}
}

export class URLBuilder {
	constructor(factory) {
		this.factory = factory;
		this.base = "http://ibf.logs:8082/api/";
		this.orderedParts = [this.base,];
	}

	endpoint(endpoint) {
		this.orderedParts.push(endpoint);
		return this;
	}

	page_state() {
		this.orderedParts.push(this.factory.pagestateParams);
		return this;
	}

	filter() {
		if (!(this.factory.filterParams === null)) {
			this.orderedParts.push(this.factory.filterParams);
		}
		return this;
	}

	filter_column() {
		this.orderedParts.push(this.factory.filterColumnParam);
		return this;
	}

	sort() {
		if (!(this.factory.sortParams === null)) {
			this.orderedParts.push(this.factory.sortParams);
		}
		return this;
	}

	build() {
		return new URL(this.orderedParts);
	}
}

export class URLOrchestrator {
	constructor(builder) {
		this.builder = builder;
	}

	build_generic_url() {
		return this.builder.endpoint("table").page_state().build();
	}

	build_page_url() {
		if (TableState["sortingActive"]) { 
            var endpoint = "table/sorted-page";
        }
        else {
            var endpoint = "table/filtered-page";
        }
		
		return this.builder.endpoint(endpoint).page_state().filter().sort().build();
	}

	build_sorted_view_url(page_params,filter_params,sort_params) {
		return this.builder.endpoint("table/sorted-view").page_state().filter().sort().build();
	}

	build_filtered_view_url(page_params,filter_params) {
		return this.builder.endpoint("table/get-filtered-view").page_state().filter().build();
	}

	build_filter_values_url(column) {
		return this.builder.endpoint("table/unique-values").page_state().filter_column(column).build();
	}
}

export class QueryStringFactory {
	constructor() {
		this.sortParams = null;
		this.filterParams = null;
		this.pagestateParams = null;
		this.filterColumnParam = null;
	}

	#updatepagestateParams(parameter) {
		if (this.pagestateParams) {
			this.pagestateParams = [this.pagestateParams,parameter].join("&");
		}
		else {
			this.pagestateParams = parameter;
		}
	}

	#updatefilterParams(filter,filter_object) {
		let filterValues = null;
		if (filter_object[filter].length > 0) {
			filterValues = filter_object[filter].join(",");
			let parameter = [filter,filterValues].join("=");

			if (this.filterParams) {
				this.filterParams = [this.filterParams,parameter].join("&");
			}
			else {
				this.filterParams = parameter;
			}
		}
		
		return this;
	}

	#updatesortParams(sort_column,sort_object) {
        let columnSort = [sort_column,sort_object[sort_column]].join("-");
        if (this.sortParams) {
        	this.sortParams = [this.sortParams,columnSort].join(",");
        }
        else {
        	this.sortParams = ["sort",columnSort].join("=");
        }
	}

	create_date() {
		let dateParameter = ["date",TableState["dateRange"]].join("=");
		this.#updatepagestateParams(dateParameter);
		
		return this;
	}

	create_predicate(page_direction) {
		let predicate = null; 
		if (page_direction === "next") {
			predicate = PaginationState["nextPagePredicate"];
		}
		else {
			predicate = PaginationState["previousPagePredicate"];
		}

		let predicateParameter = ["predicate",predicate].join("=");
		this.#updatepagestateParams(predicateParameter);

		return this;
	}

	create_pagedirection(page_direction) {
		let pagedirectionParameter = null;
		if (page_direction === "next") {
			pagedirectionParameter = "dir=left";
		}
		else {
			pagedirectionParameter = "dir=right";
		}

		this.#updatepagestateParams(pagedirectionParameter);
	
		return this;
	}

	create_pagenumber() {
		let pageNumParameter = ["pageNumber",PaginationState["currentPage"]].join("=");
		this.#updatepagestateParams(pageNumParameter);

		return this;
	}

	create_filterstatus() {
		let filterStatusParameter = ["filter",TableState["filtersActive"]].join("=");
		this.#updatepagestateParams(filterStatusParameter);

		return this
	}

	create_filter() {
		let filterParameters = deepCopyObject(PageInstances.table.filterController.stateManager);
		Object.keys(filterParameters).
			forEach(
				(key) => this.#updatefilterParams(key,filterParameters)
			);

		return this;
	}

	create_sort() {
		let sortObject = deepCopyObject(PageInstances.table.sortController.stateManager); 
		Object.keys(sortObject).
			forEach(
				(key) => this.#updatesortParams(key,sortObject)
			);

	    return this;
	}

	create_filtercolumn(column) {
		this.filterColumnParam = ["column",column].join("=");
		return this;
	}
}