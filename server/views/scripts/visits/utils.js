function validate_date_input(date_object) { 
    if ((date_object["startDate"] === "" & date_object["endDate"] != "") || 
       (date_object["endDate"] === "" & date_object["startDate"] != "")) {
        alert("Start and end dates must either both be populated or null."); 
    	throw new Error("Start and end dates must either both be populated or null.");
    }
    else {
        if (date_object["startDate"] === "" & date_object["endDate"] === "") { 
            const dateString = null;
            PageState["dateRange"] = dateString;
            return dateString; 
        }
        else { 
            const dateString = `${date_object["startDate"]},${date_object["endDate"]}`; 
            PageState["dateRange"] = dateString;
            console.log(PageState["dateRange"]);
            return dateString;
        }
    }
}