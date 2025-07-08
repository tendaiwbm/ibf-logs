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
    ObjectUtils.upsert_items(PageState,param_dict);
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

function filtersActiveUpdate() {
    PageState["filtersActive"] = !ObjectUtils.all_array_values_empty(FilterState);
}

function sortingActiveUpdate() {
    PageState["sortingActive"] = !ObjectUtils.is_empty(SortState);
}

function deepCopyObject(object) {
    return JSON.parse(JSON.stringify(object));
}

function update_page_number() {
    const pageNumberElement = document.getElementById("page-number");
    pageNumberElement.innerText = `Page ${PageState["currentPage"]} / ${PageState["numPages"]}`;
}

function close_open_filter_dropdown(clicked_filter) {
    for (var key in FilterState) {
        if (key != clicked_filter) {
            var filterDropdown = document.getElementById(`${key.toLowerCase()}-filter-dropdown`);
            if (filterDropdown) {
                filterDropdown.style.display = "none";
            }
        }
    }
}

function updateSortState(column) {
    if (SortState.hasOwnProperty(column)) {
        if (SortState[column] === "desc") {
            ObjectUtils.upsert_item(SortState,column,"asc");
        }
        else {
            ObjectUtils.upsert_item(SortState,column,"desc");
        }
        return;
    }
    ObjectUtils.upsert_item(SortState,column,"asc");
}

function updateFilterState(column,filter_value,filter_value_checked) {
    if (filter_value_checked) {
         ObjectUtils.insert_array_value(FilterState,column,filter_value);
        }
    else {
        ObjectUtils.remove_array_value(FilterState,column,filter_value);
    }
}

class ObjectUtils {
    static all_array_values_empty(object) {
        return Object.values(object).
                    every(
                        (array) => array.length === 0 
                    )
    }

    static is_empty(object) {
        for (const key in object) {
            if (Object.hasOwn(object,key)) {
                return false;
            }
        }
        return true;
    }

    static empty(object) { 
        for (const key in object) {
            delete object[key];
        }
        return object;
    }

    static upsert_item(object,key,value) {
        object[key] = value;
    }

    static upsert_items(object,params) {
        Object.keys(params).
            forEach(
                (key) => object[key] = params[key]
            )
    }

    static insert_array_value(object,key,value) {
        object[key].push(value);
    }

    static remove_array_value(object,key,value) {
        object[key] = object[key].filter(item => item != value);
    }
}
