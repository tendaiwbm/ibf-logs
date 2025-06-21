function validate_date_input(date_object) { 
    if ((date_object["startDate"] === "" & date_object["endDate"] != "") || 
       (date_object["endDate"] === "" & date_object["startDate"] != "")) {
        alert("Start and end dates must either both be populated or null."); 
    	throw new Error("Start and end dates must either both be populated or null.");
    }
    else {
        if (date_object["startDate"] === "" & date_object["endDate"] === "") { 
            const dateString = null;
            const paramDict = {"dateRange": dateString};
            updatePageState(paramDict);
        }
        else { 
            const dateString = `${date_object["startDate"]},${date_object["endDate"]}`; 
            const paramDict = {"dateRange": dateString};
            updatePageState(paramDict);
        }
    }
}

function updatePageState(param_dict) {
    for (var parameter in param_dict) {
        PageState[parameter] = param_dict[parameter];
    }
}

function updatePaginationButtonsState() {
    if (PageState["currentPage"] === PageState["numPages"]) {
            const nextButton = document.getElementById("next-page");
            PaginationButtonsState["next-page"] = true;
            nextButton.disabled = PaginationButtonsState["next-page"];
    }
    
    if (PageState["currentPage"] > 1) {
        const previousButton = document.getElementById("previous-page");
        PaginationButtonsState["previous-page"] = false;
        previousButton.disabled = PaginationButtonsState["previous-page"];
    }

    if (PageState["currentPage"] < PageState["numPages"]) {
            const nextButton = document.getElementById("next-page");
            PaginationButtonsState["next-page"] = false;
            nextButton.disabled = PaginationButtonsState["next-page"];
        }
       
    if (PageState["currentPage"] === 1) {
        const previousButton = document.getElementById("previous-page");
        PaginationButtonsState["previous-page"] = true;
        previousButton.disabled = PaginationButtonsState["previous-page"];
    }

}

function resetUrlBuilderObject() {
    for (var urlParameter in UrlBuilderObject["query"]) {
        delete UrlBuilderObject["query"][urlParameter];
    }
    UrlBuilderObject["endpoint"] = "";
} 

function updateUrlBuilderObject() {
    var counter = 0;
    for (var key in FilterState) {
        if (FilterState[key].length > 0) {
            UrlBuilderObject["query"][key] = FilterState[key].join(",");
            PageState["filtersActive"] = true;    
        }
        else {
            counter += 1;
        }
    }

    if (counter == FilterColumns.length) {
        PageState["filtersActive"] = false;
    }
}

function deepCopyObject(object) {
    return JSON.parse(JSON.stringify(object));
}

function update_page_number() {
    const pageNumberElement = document.getElementById("page-number");
    pageNumberElement.innerText = `Page ${PageState["currentPage"]} / ${PageState["numPages"]}`;
}

function close_other_filter_dropdown(clicked_filter) {
    for (var key in FilterState) {
        if (key != clicked_filter) {
            var filterDropdown = document.getElementById(`${key.toLowerCase()}-filter-dropdown`);
            if (filterDropdown) {
                filterDropdown.style.visibility = "hidden";
            }
        }
    }
}
