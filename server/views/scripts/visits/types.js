class Table {
    constructor(data) {
        this.page = 1;
        this.pointer = null;
        this.generate_dom(data);
        // create and display table
        // attach event listeners
        // future: add page_size parameter that takes UI input
        // currently: hard-coded size is 10
    }

    build_url(date_string,page_predicate,page_direction) {
        return 1;
    }

    next_page() {
        return 1;
        // get date predicate
        // set page_direction
        // get start & end dates
    }

    previous_page() {
        return 1;
    }

    generate_dom(data) {

        // const caption = "<caption>IBF Log Entries</caption>"
        const caption = "";

        var tableColumns = `<thead style="z-index: 3"><tr>`;
        for (let i=0;i<data["columns"].length;i++) {
            const column = `<th scope="col">${data["columns"][i]}</th>`;
            tableColumns = tableColumns + column;    

            if (i == (data["columns"].length - 1)) { tableColumns = tableColumns + "</tr></thead>"; }
        }

        // console.log(tableColumns);
        
        // construct n rows
        // n = pageSize
        // next & previous buttons


        var tableRows = "<tbody>";
        const openTag = `<tr style="line-height: 30px; ">`;
        const closeTag = "</tr>";
        for (let i=0;i<data["rows"].length;i++) {
            var rowValues = "";
            for (let j=0;j<data["columns"].length;j++) {
                if (j == 0) { 
                    const rowValue = `<th scope="row" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border: 1px solid rgb(160 160 160);">${data["rows"][i][j]}</th>`;
                    rowValues = rowValues + rowValue;
                }
                else { 
                    const rowValue = `<td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border: 1px solid rgb(160 160 160);">${data["rows"][i][j]}</td>`;
                    rowValues = rowValues + rowValue;
                }
                
            }
            tableRows = `${tableRows}${openTag}${rowValues}${closeTag}`;

            if (i == (data["rows"].length - 1)) { tableRows = tableRows + "</tbody>"; }
        }
        // console.log(tableRows);

        const table = `<table style="border-collapse: collapse; border: 2px solid rgb(140 140 140); font-family: sans-serif; font-size: 0.8rem; letter-spacing: 1px; table-layout: fixed; width: 600%">${caption}${tableColumns}${tableRows}</table>`; 
        var tableContainer = document.getElementById("table");
        tableContainer.innerHTML = table;
        // console.log(table);
    }

    add_event_listeners() {
        return 1;
        /* adds event listeners
           1. next_page
           2. previous_page
        */
    }

    populate_table() {
        return 1;
        // helper to previous_page & next_page
        // populates table
    }
}

class Visits {

    validate_date_input(date_object) { 
        if ((date_object["startDate"] === "" & date_object["endDate"] != "") || 
           (date_object["endDate"] === "" & date_object["startDate"] != "")) {
            alert("Start and end dates must either both be populated or null."); 
            // clear both date fields
        }
        else {
            if (date_object["startDate"] === "" & date_object["endDate"] === "") { return null; }
            else { return `${date_object["startDate"]},${date_object["endDate"]}`; }
        }
    }
    
    static build_url(date_string) { 
        var url = `${BASE}v=table&date=${date_string}`;
        return url;
    }
        
    add_event_listeners() { 
        var button = document.getElementById("generate-logs-table");
        button.addEventListener("click",this.invoke_data_retrieval);
    }    
        
    static response_handler(event,response) {
        const responseJSON = JSON.parse(response);
        const table = new Table(responseJSON);
        // table & graph must be hidden by default
        // only enabled after both have been generated
    }

    static fetch_logs(event,start_date,end_date) {
        var dateRange = {
                     "startDate": document.getElementById("start-date").value,
                     "endDate": document.getElementById("end-date").value
                    };
        var dateString = this.prototype.validate_date_input(dateRange);
        request(this.build_url(dateString),this.response_handler);
        
    }

    invoke_data_retrieval(event) {
        Visits.fetch_logs(event,document.getElementById("start-date"),document.getElementById("end-date"));
    }
}


(function main() {
    const visits = new Visits();
    visits.add_event_listeners();
}) ();
