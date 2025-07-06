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




}