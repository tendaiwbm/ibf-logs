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
            update_PageState(paramDict);
        }
        else { 
            const dateString = `${date_object["startDate"]},${date_object["endDate"]}`; 
            const paramDict = {"dateRange": dateString};
            update_PageState(paramDict);
        }
    }
}

function update_PageState(param_dict) {
    for (var parameter in param_dict) {
        PageState[parameter] = param_dict[parameter];
    }
}