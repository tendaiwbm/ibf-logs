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
            PaginationButtonsState["next-page"] = true
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
        PaginationButtonsState["previous-page"] = true
        previousButton.disabled = PaginationButtonsState["previous-page"];
    }

}

function updateUrlBuilderObject() {
    for (var parameter in UrlBuilderObject) {
        delete UrlBuilderObject.parameter;
    }
} 