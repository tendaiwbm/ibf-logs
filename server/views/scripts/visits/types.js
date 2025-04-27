class Table {
    constructor(data) {
        this.show_table(this.generate_dom(data));
        this.show_pages();
        this.add_event_listeners();
    }

    static build_url(date_string,date_predicate,page_direction) {
        return `${BASE}v=table&date=${date_string}&predicate=${date_predicate}&dir=${page_direction}`;
    }

    static fetch_next_page() {
        const tableDOM = document.getElementById("table-content");
        const lastRow = tableDOM.rows[tableDOM.rows.length -1 ];
        const datePredicate = lastRow.childNodes[1].innerText;
        const pageDirection = "left";
        
        request(this.build_url(PageState["dateRange"],datePredicate,pageDirection),this.show_next_page);
        
    }

    static show_next_page(event,response) {
        console.log(JSON.parse(response));
        // if num_records < 10 
        //     disable next-page
        // update table 

        PageState["currentPage"] += 1;
        var pageElement = document.getElementById("page-number");
        pageElement.innerText = `Page ${PageState["currentPage"]}`;
        console.log("next",PageState["currentPage"]);
    }

    previous_page() {
        const tableDOM = document.getElementById("table-content");
        const firstRow = tableDOM.rows[0];
        const datePredicate = firstRow.childNodes[1].innerText;
        const pageDirection = "right";
        
        // get start & end dates
        // request next page
        // update table 
        console.log
        PageState["currentPage"] -= 1;
        var pageElement = document.getElementById("page-number");
        pageElement.innerText = `Page ${PageState["currentPage"]}`;
        // if new page === 1 
        //     disable previous-page
        console.log("previous",PageState["currentPage"]);
    }

    invoke_next_page(event) {
        Table.fetch_next_page();        
    }

    generate_columns(columns) {
        var tableColumns = `<thead style="z-index: 3"><tr>`;
        for (let i=0;i<data["columns"].length;i++) {
            const column = `<th scope="col">${data["columns"][i]}</th>`;
            tableColumns = tableColumns + column;    

            if (i == (data["columns"].length - 1)) { tableColumns = tableColumns + "</tr></thead>"; }
        }

        return tableColumns;
    }

    generate_body(rows) {
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

        return tableRows;
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

        // tableColumns = this.generate_columns(data["columns"]);
        // tableRows = this.generate_body(data["rows"]);
        const tableDOM = `<table id="table-content" style="border-collapse: collapse; border: 2px solid rgb(140 140 140); font-family: sans-serif; font-size: 0.8rem; letter-spacing: 1px; table-layout: fixed; width: 600%;">${caption}${tableColumns}${tableRows}</table>`; 
        return tableDOM;
    }

    show_table(dom) {
        var tableContainer = document.getElementById("table");
        tableContainer.innerHTML = dom;
    }

    show_pages() {
        var pages = `<div id="pagination"><button id="previous-page">Prev</button><span id="page-number">Page 1</span><button id="next-page">Next</button></div>`;
        var plotSpace = document.getElementById("plot-space");
        plotSpace.innerHTML += pages;
        // if currentPage === 0 
        //     disable previous-page button
    }

    add_event_listeners() {
        document.getElementById("next-page").addEventListener("click",this.invoke_next_page); 
        document.getElementById("previous-page").addEventListener("click",this.previous_page);  
    }
}

class Visits {
    constructor() {
        this.add_event_listeners();
    }

    validate_date_input(date_object) { 
        if ((date_object["startDate"] === "" & date_object["endDate"] != "") || 
           (date_object["endDate"] === "" & date_object["startDate"] != "")) {
            alert("Start and end dates must either both be populated or null."); 
            // clear both date fields
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
                return dateString;
            }
        }
    }
    
    static build_url(date_string) { 
        var url = `${BASE}date=${date_string}`;
        return url;
    }
        
    add_event_listeners() { 
        var button = document.getElementById("generate-logs-table");
        button.addEventListener("click",this.invoke_data_retrieval);
    }    
        
    static visits_response_handler(event,response) {
        const responseJSON = JSON.parse(response);
        var table = new Table(responseJSON);
        // table & graph must be hidden by default
        // only enabled after both have been generated
    }

    static fetch_logs(event,start_date,end_date) {
        var dateRange = {
                     "startDate": document.getElementById("start-date").value,
                     "endDate": document.getElementById("end-date").value
                    };
        var dateString = this.prototype.validate_date_input(dateRange);
        request(this.build_url(dateString),this.visits_response_handler);
        
    }

    invoke_data_retrieval(event) {
        Visits.fetch_logs(event,document.getElementById("start-date"),document.getElementById("end-date"));
    }
}

