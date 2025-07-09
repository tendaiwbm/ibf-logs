class URL {
	constructor(url_parts) {
		this.resource = url_parts.slice(0,2).join("/");
		this.queryString = url_parts.slice(2).join("&");
		this.url = [this.resource,this.queryString].join("?");
	}
}

class URLBuilder {
	constructor() {
		this.base = "http://ibf.logs:8082/api/visits";
		this.orderedParts = [this.base,];
	}

	endpoint(endpoint) {
		this.orderedParts.push(endpoint);
		return this;
	}

	date_interval(date) {
		date = ["date",date].join("=");
		this.orderedParts.push(date);
		return this;
	}

	page_param(param_name,param_container) {
		this.orderedParts.push([param_name,param_container[param_name]].join("="));
		return this;
	}

	filter(filter_name,filter_container) {
		if (filter_container[filter_name].length > 0) {
			this.orderedParts.push([filter_name,filter_container[filter_name].join(",")].join("="));
		}
		return this;
	}

	filter_column(column) {
		this.orderedParts.push(["column",column].join("="));
		return this;
	}

	sort(sort_object) {
		let sortString = "";
		for (var key in sort_object) {
	        var columnSort = [key,sort_object[key]].join("-");
	        if (sortString === "") {
	        	sortString = columnSort;
	        }
	        else {
	        	sortString = [sortString,columnSort].join(",");
	        }
	    }

		this.orderedParts.push(["sort",sortString].join("="));
		return this;
	}

	build() {
		return new URL(this.orderedParts);
	}
}

class URLOrchestrator {
	constructor(builder) {
		this.builder = builder;
	}

	build_generic_url(date_param) {
		return this.builder.endpoint("").date_interval(date_param).build();
	}

	build_page_url(page_params,filter_params,sort_params) {
		if (PageState["sortingActive"]) { 
            var endpoint = "sorted-page";
        }
        else {
            var endpoint = "filtered-page";
        }
		
		this.builder.endpoint(endpoint);
		
		Object.keys(page_params).
			forEach(
				(key) => this.builder.page_param(key,page_params)
			);
		
		Object.keys(filter_params).
			forEach(
				(key) => this.builder.filter(key,filter_params)
			);

		if (PageState["sortingActive"]) {
			this.builder.sort(sort_params);
		}

		return this.builder.build();
	}

	build_sorted_view_url(page_params,filter_params,sort_params) {
		this.builder.endpoint("sorted-view");

		Object.keys(page_params).
			forEach(
				(key) => this.builder.page_param(key,page_params)
			);

		Object.keys(filter_params).
			forEach(
				(key) => this.builder.filter(key,filter_params)
			);

		this.builder.sort(sort_params);

		return this.builder.build()
	}

	build_filtered_view_url(page_params,filter_params) {
		this.builder.endpoint("get-filtered-view");

		Object.keys(page_params).
			forEach(
				(key) => this.builder.page_param(key,page_params)
			);

		Object.keys(filter_params).
			forEach(
				(key) => this.builder.filter(key,filter_params)
			);

		return this.builder.build();
	}

	build_filter_values_url(column) {
		return this.builder.endpoint("unique-values").filter_column(column).build();
	}
}

class QueryStringFactory {
	constructor() {
		this.sortParams = null;
		this.filterParams = null;
		this.pageParams = null;
	}

	updatepageParams(parameter) {
		if (this.pageParams) {
			this.pageParams = [this.pageParams,parameter].join("&");
		}
		else {
			this.pageParams = parameter;
		}
	}

	updatefilterParams(filter,filter_object) {
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

	create_date_parameter() {
		let dateParameter = ["date",PageState["dateRange"]].join("=");
		this.updatepageParams(dateParameter);
		
		return this;
	}

	create_predicate_parameter(page_direction) {
		let predicate = null; 
		if (page_direction === "next") {
			predicate = PageState["nextPagePredicate"];
		}
		else {
			predicate = PageState["previousPagePredicate"];
		}

		let predicateParameter = ["predicate",predicate].join("=");
		this.updatepageParams(predicateParameter);
		
		return this;
	}

	create_pagedirection_parameter(page_direction) {
		let pagedirectionParameter = null;
		if (page_direction === "next") {
			pagedirectionParameter = "dir=left";
		}
		else {
			pagedirectionParameter = "dir=right";
		}

		this.updatepageParams(pagedirectionParameter);
	
		return this;
	}

	create_pagenumber_parameter() {
		let pageNumParameter = PageState["currentPage"];
		this.updatepageParams(pageNumParameter);

		return this;
	}

	create_filterstatus_parameter() {
		let filterStatusParameter = ["filter",PageState["filtersActive"]].join("=");
		this.updatepageParams(filterStatusParameter);

		return this
	}

	create_filter_parameters() {
		let filterParameters = deepCopyObject(FilterState);
		Object.keys(filterParameters).
			forEach(
				(key) => this.updatefilterParams(key,filterParameters)
			);

		return this;
	}

	create_sort_parameter() {
		let sortObject = deepCopyObject(SortState); 
		let sortString = "";

		for (var key in sortObject) {
	        var columnSort = [key,sortObject[key]].join("-");
	        if (this.sortParams) {
	        	this.sortParams = [this.sortParams,columnSort].join(",");
	        }
	        else {
	        	this.sortParams = ["sort",columnSort].join("=");
	        }
	    }
	    
	    return this;
	}





}