class Table {
    constructor(data) {
        const paramDict = { "numRecords": data["rows"].length };
        updatePageState(paramDict);
        this.set_num_pages()
        var responseTableEntries = data;
        responseTableEntries["rows"] = responseTableEntries["rows"].slice(0,10);
        this.show_table(this.generate_table_dom(responseTableEntries));
        this.show_pages();
        this.add_event_listeners();
        Table.update_date_predicate(responseTableEntries);
    }

    static build_url(date_string,date_predicate,page_direction) {
        const url = `${BASE}${PAGE_ROUTE}?v=table&date=${date_string}&predicate=${date_predicate}&dir=${page_direction}`;
        return url;
    }

    static update_date_predicate(data) {
        if (PageState["currentPage"] === 1) {
            const paramDict = { "nextPagePredicate": data["rows"][9][0] };
            updatePageState(paramDict);
        }

        else if (PageState["currentPage"] > 1) {
            const paramDict = { 
                                "nextPagePredicate": data["rows"][9][0],
                                "previousPagePredicate": data["rows"][0][0]
                              };
            updatePageState(paramDict);
        }
    }

    set_num_pages() {
        const numPages = (PageState["numRecords"] + (PageState["pageSize"] - (PageState["numRecords"]%PageState["pageSize"]))) / PageState["pageSize"];
        const paramDict = { "numPages": numPages };
        updatePageState(paramDict);
    }

    static fetch_next_page() {
        const datePredicate = PageState["nextPagePredicate"];
        const pageDirection = "left";
        
        request(this.build_url(PageState["dateRange"],datePredicate,pageDirection),this.table_response_inspector,this.show_next_page);
        
    }

    static table_response_inspector(event,response_handler,response) {
        response_handler(event,response);
    }

    static show_next_page(event,response) {
        const nextPage = JSON.parse(response);
        // consider updating rows & columns instead of regenerating DOM
        PageInstances["table"].show_table(PageInstances["table"].generate_table_dom(nextPage));
        
        const paramDict = { "currentPage": PageState["currentPage"] + 1 };
        updatePageState(paramDict);

        var pageElement = document.getElementById("page-number");
        pageElement.innerText = `Page ${PageState["currentPage"]} / ${PageState["numPages"]}`;
        
        updatePaginationButtonsState();
        Table.update_date_predicate(nextPage);
    
    }

    static fetch_previous_page() {
        const datePredicate = PageState["previousPagePredicate"];
        const pageDirection = "right";
        
        request(this.build_url(PageState["dateRange"],datePredicate,pageDirection),this.table_response_inspector,this.show_previous_page);
        
    }

    static show_previous_page(event,response) {
        const previousPage = JSON.parse(response);
        // consider updating rows & columns instead of regenerating DOM
        PageInstances["table"].show_table(PageInstances["table"].generate_table_dom(previousPage));
        
        const paramDict = { "currentPage": PageState["currentPage"] - 1 };
        updatePageState(paramDict);
        
        var pageElement = document.getElementById("page-number");
        pageElement.innerText = `Page ${PageState["currentPage"]} / ${PageState["numPages"]}`;
        
        updatePaginationButtonsState();
        Table.update_date_predicate(previousPage);

    }

    invoke_page_fetching(event) {
        if (event.srcElement.id === "next-page") { 
            Table.fetch_next_page();
        }
        else if (event.srcElement.id === "previous-page") {
            Table.fetch_previous_page();
        }
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

    generate_table_dom(data) {
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
        for (let i=0;i<PageState["pageSize"];i++) {
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
        const filterDOM = this.generate_filter_dom();
        const tableDOM = `<table id="table-content" style="border-collapse: collapse; border: 2px solid rgb(140 140 140); font-family: sans-serif; font-size: 0.8rem; letter-spacing: 1px; table-layout: fixed; width: 200%;">${caption}${tableColumns}${tableRows}</table>`; 
        return {"table": tableDOM, "filters": filterDOM};
    }

    generate_filter_dom() {
        var filtersDOMElements = "";
        for (let i=0;i<FilterColumns.length;i++) {
            const column = FilterColumns[i];
            const button = `<div id="${column.toLowerCase()}-filter-button-container">
                                <button id="${column.toLowerCase()}-filter-button" class="table-filter-button">${column}</button>
                            </div>`;
            filtersDOMElements = filtersDOMElements + button;
        }

         return filtersDOMElements;
    }

    show_table(dom) {
        var tableContainer = document.getElementById("table-element");
        tableContainer.innerHTML = dom["table"];
        var filterContainer = document.getElementById("filter-container");
        filterContainer.innerHTML = dom["filters"];
    }

    show_pages() {
        var pages = `<div id="pagination"><button id="previous-page" disabled=true>Prev</button><span id="page-number">Page 1 / ${PageState["numPages"]}</span><button id="next-page">Next</button></div>`;
        var plotSpace = document.getElementById("plot-space");
        plotSpace.innerHTML += pages;
    }

    add_event_listeners() {
        document.getElementById("next-page").addEventListener("click",this.invoke_page_fetching); 
        document.getElementById("previous-page").addEventListener("click",this.invoke_page_fetching);
        
        var filterButtons = document.getElementsByClassName("table-filter-button");
        for (var i = 0; i < filterButtons.length; i++) {
            filterButtons[i].addEventListener("click",this.invoke_filter_values_fetching);
        }
    }

    static fetch_column_filter_values(event) {
        const column = event.srcElement.innerText;
        // this.show_column_filter_values(column, ["Amsterdam", "Johannesburg", "Kampala"]);
        console.log(["Amsterdam", "Johannesburg", "Kampala"]);

        // request(this.build_url(PageState["dateRange"],datePredicate,pageDirection),this.table_response_inspector,this.show_next_page);
    }

    // static show_column_filter_values(column_name,value_array) {
    //     if (column_name === "ClientType") {
    //         const filterButton = document.getElementById("name-filter-button").getBoundingClientRect();
    //         console.log(filterButton.left + window.scrollX);
    //         console.log(filterButton.top + window.scrollY);
    //         const filterValueDropdownId = `${column_name.toLowerCase()}-filter-dropdown`;
    //         var filterValueDropdown = `<div id="${filterValueDropdownId}">
    //                                         <input type="checkbox" id="scales" name="scales" checked />
    //                                         <label for="scales">Scales</label>
    //                                      </div>
    //                                      <div>
    //                                         <input type="checkbox" id="horns" name="horns" />
    //                                         <label for="horns">Horns</label>
    //                                      </div>`;
    //         console.log(filterValueDropdown);
    //         var filterContainer = document.getElementById("filter-container");
    //         filterContainer = filterContainer.innerHTML + filterValueDropdown;
    //         console.log(filterContainer);
    //     }
    // }

    invoke_filter_values_fetching(event) {
        Table.fetch_column_filter_values(event);    
    }
}


class Visits {
    constructor() {
        this.add_event_listeners();
    }
    
    static build_url(date_string) { 
        var url = `${BASE}?date=${date_string}`;
        return url;
    }
        
    add_event_listeners() { 
        var button = document.getElementById("generate-logs-table");
        button.addEventListener("click",this.invoke_data_retrieval);
    }    

    static visits_response_handler(event,response) {
        var table = new Table(response);
        PageInstances["table"] = table;
        // table & graph must be hidden by default
        // only enabled after both have been generated
        
    }

    static visits_response_inspector(event,response_handler,response) {
        const responseJSON = JSON.parse(response);
        if (responseJSON.hasOwnProperty("error")) {
            alert(`${responseJSON["error"]}`);
            throw new Error(`${responseJSON["error"]}`);
        }

        else {
            response_handler(event,responseJSON);
        }
 
    }

    static fetch_logs(event,start_date,end_date) {
        DateRangeState["startDate"] = document.getElementById("start-date").value;
        DateRangeState["endDate"] = document.getElementById("end-date").value;
        validate_date_input(DateRangeState);
        request(this.build_url(PageState["dateRange"]),this.visits_response_inspector,this.visits_response_handler);
    }

    invoke_data_retrieval(event) {
        Visits.fetch_logs(event,document.getElementById("start-date"),document.getElementById("end-date"));
    }
}

