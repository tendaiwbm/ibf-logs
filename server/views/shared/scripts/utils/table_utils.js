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
         ObjectUtils.insert_array_value(PageInstances.table.filterController.stateManager,column,filter_value);
        }
    else {
        ObjectUtils.remove_array_value(PageInstances.table.filterController.stateManager,column,filter_value);
    }
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

function update_page_number() {
    const pageNumberElement = document.getElementById("page-number");
    pageNumberElement.innerText = `Page ${PageState["currentPage"]} / ${PageState["numPages"]}`;
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