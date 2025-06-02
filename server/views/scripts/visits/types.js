class Table {
    constructor(data) {
        const paramDict = { "numRecords": data["rows"].length };
        updatePageState(paramDict);
        this.set_num_pages()
        var responseTableEntries = data;
        responseTableEntries["rows"] = responseTableEntries["rows"].slice(0,10);
        this.show_table(this.generate_table_dom(responseTableEntries));
        this.show_table_filters(this.generate_filter_dom());
        this.show_pages();
        this.add_event_listeners();
        Table.update_date_predicate(responseTableEntries);
    }

    static build_url(param_dict) {
        var queryString = "";
        for (var key in param_dict) {
            const parameter = `&${key}=${param_dict[key]}`;
            queryString = queryString + parameter;
        }
        
        const url = `${BASE}${PAGE_ROUTE}?v=table${queryString}`;
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
        UrlBuilderObject["query"]["date"] = PageState["dateRange"];
        UrlBuilderObject["query"]["predicate"] = PageState["nextPagePredicate"];
        UrlBuilderObject["query"]["dir"] = "left";
        UrlBuilderObject["endpoint"] = "/page";

        request(build_url(UrlBuilderObject),this.table_response_inspector,this.show_next_page);
        
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
        updateUrlBuilderObject();
    }

    static fetch_previous_page() {
        UrlBuilderObject["query"]["date"] = PageState["dateRange"];
        UrlBuilderObject["query"]["predicate"] = PageState["previousPagePredicate"];
        UrlBuilderObject["query"]["dir"] = "right";
        UrlBuilderObject["endpoint"] = "/page";

        request(build_url(UrlBuilderObject),this.table_response_inspector,this.show_previous_page);
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
        updateUrlBuilderObject();
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
        const tableDOM = `<table id="table-content" style="border-collapse: collapse; border: 2px solid rgb(140 140 140); font-family: sans-serif; font-size: 0.8rem; letter-spacing: 1px; table-layout: fixed; width: 200%;">${caption}${tableColumns}${tableRows}</table>`; 
        return tableDOM;
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
        tableContainer.innerHTML = dom;
        
    }

    show_table_filters(dom) {
        var filterContainer = document.getElementById("filter-container");
        filterContainer.innerHTML = dom;
    }

    show_pages() {
        var pages = `<div id="pagination">
                       <button id="previous-page" disabled=true>Prev</button>
                       <span id="page-number">Page 1 / ${PageState["numPages"]}</span>
                       <button id="next-page">Next</button>
                     </div>`;
        var plotSpace = document.getElementById("plot-space");
        plotSpace.innerHTML += pages;
    }

    add_event_listeners() {
        document.getElementById("next-page").addEventListener("click",this.invoke_page_fetching); 
        document.getElementById("previous-page").addEventListener("click",this.invoke_page_fetching);
        
        for (let i=0;i<FilterColumns.length;i++) {
            const column = FilterColumns[i].toLowerCase();
            const buttonId = `${column}-filter-button`;
            const button = document.getElementById(buttonId);
            button.addEventListener("click",this.invoke_filter_values_fetching);
        }
    }

    static fetch_column_filter_values(event) {
        const column = event.srcElement.innerText;
        UrlBuilderObject["query"]["column"] = column;
        UrlBuilderObject["endpoint"] = "/unique-values";
        
        request(build_url(UrlBuilderObject),this.table_response_inspector,this.show_column_filter_values);
    }

    static show_column_filter_values(event,response) {
        const filterResponse = JSON.parse(response);
        const column = filterResponse["column"];
        const values = filterResponse["values"];

        // get event-filter-button-container
        const buttonContainerId = `${column.toLowerCase()}-filter-button-container`;
        const buttonContainer = document.getElementById(buttonContainerId);
        const filterDropdownId = `${column.toLowerCase()}-filter-dropdown`;

        var filterValuesDOM = "";
        for (var i=0;i<values.length;i++) {
            const filterValue = values[i];
            const filterValueDOM = `<div>
                                      <input type="checkbox" id="${filterValue.toLowerCase()}" class="filter-option" name="${filterValue.toLowerCase()}"/>
                                      <label for="${filterValue.toLowerCase()}">${filterValue}</label>
                                    </div>`;
            filterValuesDOM = filterValuesDOM + filterValueDOM;
        }

        var filterDropdown = `<div id="${filterDropdownId}" class="filter-dropdown">${filterValuesDOM}</div>`;
        buttonContainer.innerHTML = buttonContainer.innerHTML + filterDropdown;
        
        var filterOptions = document.getElementsByClassName("filter-option");
        for (var i = 0; i < filterOptions.length; i++) {
            filterOptions[i].addEventListener("click",Table.filter_value_clicked);
        }
        // updateUrlBuilderObject();
        // console.log(UrlBuilderObject);
        // console.log(filterResponse);
    }

    static filter_value_clicked(event) {
        const inputElement = document.getElementById(event.srcElement.id);
        const filterValue = event.srcElement.nextElementSibling.innerText;
        const column = event.srcElement.parentNode.parentNode.previousElementSibling.innerText;     
        if (inputElement.checked) {
            FilterState[column].push(filterValue);
        }
        else {
            FilterState[column] = FilterState[column].filter(item => item != filterValue);
        }
    }

    invoke_filter_values_fetching(event) {
        Table.fetch_column_filter_values(event);    
    }
}


class Visits {
    constructor() {
        this.add_event_listeners();
    }
    
    static build_url(param_dict) {
        var queryString = "";
        // let op: only 1 key in param_dict for now
        // daarom geen "&"
        for (var key in param_dict["query"]) {
            const parameter = `${key}=${param_dict["query"][key]}`;
            queryString = queryString + parameter;
        }

        const url = `${BASE}?${queryString}`;
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
        
        updateUrlBuilderObject();
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
        UrlBuilderObject["query"]["date"] = PageState["dateRange"];

        request(build_url(UrlBuilderObject),this.visits_response_inspector,this.visits_response_handler);
    }

    invoke_data_retrieval(event) {
        Visits.fetch_logs(event,document.getElementById("start-date"),document.getElementById("end-date"));
    }
}

