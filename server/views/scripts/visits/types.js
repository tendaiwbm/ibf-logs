class Table {
    constructor(data) {
        const paramDict = { "numRecords": data["rows"].length, "filtersActive": false, "sortingActive": false };
        updatePageState(paramDict);
        this.set_num_pages()

        var responseTableEntries = deepCopyObject(data);
        responseTableEntries["rows"] = responseTableEntries["rows"].slice(0,10);

        this.show_table(this.generate_table_dom(responseTableEntries));
        this.show_table_filters(this.generate_filter_dom());
        this.show_pages();
        this.add_event_listeners();

        Table.update_date_predicate(responseTableEntries);
    }

    static update_date_predicate(data) {
        var paramDict = {
                          "nextPagePredicate":     null,
                          "previousPagePredicate": null
                        };

        if (PageState["currentPage"] === 1) {
            paramDict.nextPagePredicate = data["rows"][data["rows"].length - 1][0];
        }

        if (PageState["currentPage"] === PageState["numPages"]) {
            paramDict.previousPagePredicate = data["rows"][0][0];
        }

        if ((PageState["currentPage"] > 1) && (PageState["currentPage"] < PageState["numPages"])) {
            paramDict.nextPagePredicate = data["rows"][data["rows"].length - 1][0];
            paramDict.previousPagePredicate = data["rows"][0][0];
        }

        updatePageState(paramDict);
    }

    set_num_pages() {
        const numPages = Math.ceil(PageState["numRecords"] / PageState["pageSize"]);
        const paramDict = { "numPages": numPages };
        updatePageState(paramDict);
    }

    static fetch_next_page() {
        UrlBuilderObject["query"]["date"] = PageState["dateRange"];
        UrlBuilderObject["query"]["predicate"] = PageState["nextPagePredicate"];
        UrlBuilderObject["query"]["dir"] = "left";
        UrlBuilderObject["endpoint"] = "/page";

        if (PageState["filtersActive"]) {
            updateUrlBuilderObject("filter");
        }
        
        UrlBuilderObject["query"]["filter"] = PageState["filtersActive"];
        request(build_url(UrlBuilderObject),this.table_response_inspector,this.show_next_page);
      
    }

    static table_response_inspector(event,response_handler,response) {
        const responseJSON = JSON.parse(response);
        if (responseJSON.hasOwnProperty("message")) {
            if (responseJSON["message"] === "No records returned") {
                throw new Error(`${responseJSON["message"]}`);
            }
            else {
                console.log(responseJSON);
            }
        }

        else {
            response_handler(event,response);
        }
    }

    static show_next_page(event,response) {
        const nextPage = JSON.parse(response);
        nextPage["rows"] = nextPage["rows"].slice(0,10);
        // consider updating rows & columns instead of regenerating DOM
        PageInstances["table"].show_table(PageInstances["table"].generate_table_dom(nextPage));
        
        const paramDict = { "currentPage": Math.min(PageState["currentPage"] + 1, PageState["numPages"]) };
        updatePageState(paramDict);

        update_page_number();
        updatePaginationButtonsState();
        Table.update_date_predicate(nextPage);
        resetUrlBuilderObject();
    }

    static fetch_previous_page() {
        UrlBuilderObject["query"]["date"] = PageState["dateRange"];
        UrlBuilderObject["query"]["predicate"] = PageState["previousPagePredicate"];
        UrlBuilderObject["query"]["dir"] = "right";
        UrlBuilderObject["endpoint"] = "/page";
        
        if (PageState["filtersActive"]) {
            updateUrlBuilderObject("filter");
        }

        UrlBuilderObject["query"]["filter"] = PageState["filtersActive"];
        request(build_url(UrlBuilderObject),this.table_response_inspector,this.show_previous_page);
    }

    static show_previous_page(event,response) {
        var previousPage = JSON.parse(response);
        previousPage["rows"] = previousPage["rows"].slice(0,10);
        // consider updating rows & columns instead of regenerating DOM
        PageInstances["table"].show_table(PageInstances["table"].generate_table_dom(previousPage));
        
        const paramDict = { "currentPage": Math.max(PageState["currentPage"] - 1, 1) };
        updatePageState(paramDict);
        
        update_page_number();
        updatePaginationButtonsState();
        Table.update_date_predicate(previousPage);
        resetUrlBuilderObject();
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
        for (var i=0;i<data["columns"].length;i++) {
            const column = `<th scope="col"><button class="column-sort">${data["columns"][i]}</button></th>`;
            tableColumns = tableColumns + column;    

            if (i == (data["columns"].length - 1)) { tableColumns = tableColumns + "</tr></thead>"; }
        }

        var tableRows = "<tbody>";
        const openTag = `<tr style="line-height: 30px; ">`;
        const closeTag = "</tr>";
        for (var i=0;i<data["rows"].length;i++) {
            var rowValues = "";
            for (var j=0;j<data["columns"].length;j++) {
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
                       <span id="page-number"></span>
                       <button id="next-page">Next</button>
                     </div>`;
        var plotSpace = document.getElementById("plot-space");
        plotSpace.innerHTML += pages;
        update_page_number();
    }

    add_event_listeners() {
        document.getElementById("next-page").addEventListener("click",this.invoke_page_fetching); 
        document.getElementById("previous-page").addEventListener("click",this.invoke_page_fetching);
        window.addEventListener("click", (event) => {
                                                        var filterContainer = document.getElementById("filter-container");
                                                        const insideFilterContainer = event.composedPath().includes(filterContainer);
                                                        if (!insideFilterContainer) { close_open_filter_dropdown("filter-container"); }
                                                      })    

        for (let i=0;i<FilterColumns.length;i++) {
            const column = FilterColumns[i].toLowerCase();
            const buttonId = `${column}-filter-button`;
            const button = document.getElementById(buttonId);
            button.addEventListener("click",this.invoke_filter_values_fetching);
        }
        this.add_sorting_event_listeners();
    }

    add_sorting_event_listeners() {
        const columnSortingButtons = document.getElementsByClassName("column-sort");
        for (var button of columnSortingButtons) {
            button.addEventListener("click",this.invoke_sorted_view_fetching);
        }
    }

    static fetch_sorted_view(event) {
        const sortingColumn = event.srcElement.innerText;
        update_SortState(sortingColumn);
        
        UrlBuilderObject["endpoint"] = "/sorted-view";
        UrlBuilderObject["query"]["date"] = PageState["dateRange"];
        updateUrlBuilderObject();

        const sortURL = build_url(UrlBuilderObject);
        console.log(sortURL);
        request(sortURL,Table.table_response_inspector,Table.show_sorted_view);
    }

    static fetch_column_filter_values(event) {
        const column = event.srcElement.innerText;
        UrlBuilderObject["query"]["column"] = column;
        UrlBuilderObject["endpoint"] = "/unique-values";
        
        close_open_filter_dropdown(column);
        var filterDropdown = document.getElementById(`${column.toLowerCase()}-filter-dropdown`);
        if (filterDropdown) {
            var display = filterDropdown.style.display;
            if (display === "none") {
                filterDropdown.style.display = "block";
            }
            else {
                filterDropdown.style.display = "none";
            }
        }
        else {
            request(build_url(UrlBuilderObject),this.table_response_inspector,this.show_column_filter_values);
        }
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

        var filterDropdown = document.createElement('div');
        filterDropdown.setAttribute("id",filterDropdownId);
        filterDropdown.setAttribute("class","filter-dropdown");
        filterDropdown.innerHTML = filterValuesDOM;
        buttonContainer.appendChild(filterDropdown);
        
        var filterOptions = document.getElementsByClassName("filter-option");
        for (var i = 0; i < filterOptions.length; i++) {
            filterOptions[i].addEventListener("click",Table.filter_value_clicked);
        }

        resetUrlBuilderObject();
    }

    static show_sorted_view(event,response) {
        console.log(JSON.parse(response));
    }

    static show_filtered_view(event,response) {
        const responseJSON = JSON.parse(response);
        
        const paramDict = { 
                            "numRecords": responseJSON["rows"].length,
                            "currentPage": 1
                          };

        updatePageState(paramDict);

        const tableInstance = PageInstances["table"];
        tableInstance.set_num_pages();

        var responseTableEntries = deepCopyObject(responseJSON);
        responseTableEntries["rows"] = responseTableEntries["rows"].slice(0,10);

        tableInstance.show_table(tableInstance.generate_table_dom(responseTableEntries));
        tableInstance.add_sorting_event_listeners();

        update_page_number();
        updatePaginationButtonsState();
        Table.update_date_predicate(responseTableEntries);
        resetUrlBuilderObject();
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

        UrlBuilderObject["endpoint"] = "/get-filtered-view";
        UrlBuilderObject["query"]["date"] = PageState["dateRange"];
        updateUrlBuilderObject("filter");
        
        if (PageState["filtersActive"]) {
            const filterURL = build_url(UrlBuilderObject);
            request(filterURL,Table.table_response_inspector,Table.show_filtered_view);
        }

        else {
            document.getElementById("filter-container").innerHTML = "";
            document.getElementById("table-element").innerHTML = "";
            document.getElementById("pagination").remove();
            UrlBuilderObject["endpoint"] = "";
            PageInstances["visits"].invoke_data_retrieval(event);
        }
    }

    invoke_filter_values_fetching(event) {
        Table.fetch_column_filter_values(event);    
    }

    invoke_sorted_view_fetching(event) {
        Table.fetch_sorted_view(event);
    }
}


class Visits {
    constructor() {
        this.add_event_listeners();
    }
        
    add_event_listeners() { 
        var button = document.getElementById("generate-logs-table");
        button.addEventListener("click",this.invoke_data_retrieval);
    }    

    static visits_response_handler(event,response) {
        const table = new Table(response);
        PageInstances["table"] = table;

        // table & graph must be hidden by default
        // only enabled after both have been generated
        
        resetUrlBuilderObject();
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

