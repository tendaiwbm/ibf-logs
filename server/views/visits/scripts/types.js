class Table {
    constructor(data) {
        this.stateManager = TableState;
        update_state(this.stateManager,{ "numRecords": data["rows"].length });
        
        // create and populate table
        let responseTableEntries = deepCopyObject(data);
        responseTableEntries["rows"] = responseTableEntries["rows"].slice(0,10);
        this.realise(responseTableEntries);

        // pagination controller creates & adds controls
        this.paginator = new PaginationController();

        // this.show_table_filters(this.generate_filter_dom());
        this.add_event_listeners();

        Table.update_date_predicate(responseTableEntries);
    }

    static update_date_predicate(data) {
        var paramDict = {
                          "nextPagePredicate":     null,
                          "previousPagePredicate": null
                        };

        if (PaginationState["currentPage"] === 1) {
            paramDict.nextPagePredicate = data["rows"][data["rows"].length - 1][0];
        }

        if (PaginationState["currentPage"] === PaginationState["numPages"]) {
            paramDict.previousPagePredicate = data["rows"][0][0];
        }

        if ((PaginationState["currentPage"] > 1) && (PaginationState["currentPage"] < PaginationState["numPages"])) {
            paramDict.nextPagePredicate = data["rows"][data["rows"].length - 1][0];
            paramDict.previousPagePredicate = data["rows"][0][0];
        }

        update_state(PaginationState, paramDict);
    }

    static fetch_next_page() {
        let factory = new QueryStringFactory();
        factory.
            create_date().
            create_predicate("next").
            create_pagedirection("next").
            create_filterstatus().
            create_filter();

        if (PageState["sortingActive"]) {
            factory.create_pagenumber().create_sort();
        }
        
        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let pageURL = urlOrchestrator.build_page_url().url;
        
        request(pageURL,this.response_inspector,this.show_next_page);
    }

    static response_inspector(event,response_handler,response) {
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
        const nextPageData = JSON.parse(response);
        
        nextPageData["rows"] = nextPageData["rows"].slice(0,10);
        let table = PageInstances.table;
        table.update(nextPageData);
        
        table.paginator.
                        increment_page_number().
                        update_current_page_indicator().
                        update_button_state().
                        update_date_predicates(nextPageData);
    }

    static fetch_previous_page() {
        let factory = new QueryStringFactory();
        factory.
            create_date().
            create_predicate("previous").
            create_pagedirection("previous").
            create_filterstatus().
            create_filter();
        
        if (PageState["sortingActive"]) {
            factory.create_pagenumber().create_sort();
        }

        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let url = urlOrchestrator.build_page_url().url;

        request(url,this.table_response_inspector,this.show_previous_page);
    }

    static show_previous_page(event,response) {
        var previousPage = JSON.parse(response);
        
        previousPage["rows"] = previousPage["rows"].slice(0,10);
        // consider updating rows & columns instead of regenerating DOM
        PageInstances["table"].show_table(PageInstances["table"].generate_table_dom(previousPage));
        PageInstances["table"].add_sorting_event_listeners();
        
        const paramDict = { "currentPage": Math.max(PageState["currentPage"] - 1, 1) };
        updatePageState(paramDict);
        
        update_page_number();
        updatePaginationButtonsState();
        Table.update_date_predicate(previousPage);
    }

    create_row(row,expected_num_values) {
        var tableRow = document.createElement("tr");
        tableRow.setAttribute("style","line-height: 15px");

        for (var idx=0;idx<row.length;idx++) {
            var valueDOM = document.createElement("td");
            valueDOM.textContent = row[idx];
            tableRow.appendChild(valueDOM);
        }  

        return tableRow; 
    }

    create_body(rows, expected_num_row_values) {
        let body = document.createElement("tbody");
        
        for (var idx=0;idx<rows.length;idx++) {
            let row = this.create_row(rows[idx],expected_num_row_values);
            body.appendChild(row);
        }

        return body;
    }

    create_header(columns) {
        let header = document.createElement("thead");
        let row = document.createElement("tr");

        for (var idx=0;idx<columns.length;idx++) {
            let column = document.createElement("th");
            let clickableColumnName = document.createElement("button");
            clickableColumnName.setAttribute("class","column-sort");
            clickableColumnName.textContent = columns[idx];
            
            column.appendChild(clickableColumnName);
            row.appendChild(column);
        }
        header.append(row);
        return header;
    }

    realise(data) {
        var header = this.create_header(data.columns);
        var body = this.create_body(data.rows,data.columns.length);

        let table = document.getElementById("table-element")
        table.appendChild(header);
        table.appendChild(body);
    }

    update(data) {
        let table = document.getElementById("table-element");
        table.removeChild(table.childNodes[1]);
        let newBody = this.create_body(data.rows,data.columns.length);
        table.appendChild(newBody);
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

    show_table_filters(dom) {
        var filterContainer = document.getElementById("filter-container");
        filterContainer.innerHTML = dom;
    }

    invoke_page_fetching(event) {
        if (event.srcElement.id === "next-page") { 
            Table.fetch_next_page();
        }
        else if (event.srcElement.id === "previous-page") {
            Table.fetch_previous_page();
        }
    }

    add_event_listeners() {
        document.getElementById("next-page").addEventListener("click",this.invoke_page_fetching); 
        document.getElementById("previous-page").addEventListener("click",this.invoke_page_fetching);

        // window.addEventListener("click", (event) => {
        //                                                 var filterContainer = document.getElementById("filter-container");
        //                                                 const insideFilterContainer = event.composedPath().includes(filterContainer);
        //                                                 if (!insideFilterContainer) { close_open_filter_dropdown("filter-container"); }
        //                                               })    

        // for (let i=0;i<FilterColumns.length;i++) {
        //     const column = FilterColumns[i].toLowerCase();
        //     const buttonId = `${column}-filter-button`;
        //     const button = document.getElementById(buttonId);
        //     button.addEventListener("click",this.invoke_filter_values_fetching);
        // }
        // this.add_sorting_event_listeners();
    }

    add_sorting_event_listeners() {
        const columnSortingButtons = document.getElementsByClassName("column-sort");
        for (var button of columnSortingButtons) {
            button.addEventListener("click",this.invoke_sorted_view_fetching);
        }
    }

    static fetch_sorted_view(event) {
        const sortingColumn = event.srcElement.innerText;
        updateSortState(sortingColumn);
        sortingActiveUpdate();
        
        let factory = new QueryStringFactory();
        factory.
            create_date().
            create_filterstatus().
            create_filter().
            create_sort();

        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let sortURL = urlOrchestrator.build_sorted_view_url().url;

        request(sortURL,Table.table_response_inspector,Table.show_sorted_view);
    }

    static fetch_column_filter_values(event) {
        const column = event.srcElement.innerText;
        
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

            let factory = new QueryStringFactory();
            factory.
                create_date().
                create_filterstatus().
                create_filtercolumn(column);
        
            let urlBuilder = new URLBuilder(factory);
            let urlOrchestrator = new URLOrchestrator(urlBuilder);
            let uniqueValuesURL = urlOrchestrator.build_filter_values_url().url;
            
            request(uniqueValuesURL,this.table_response_inspector,this.show_column_filter_values);
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
    }

    static show_sorted_view(event,response) {
        const responseJSON = JSON.parse(response);
        const tableContent = document.getElementById("table-content");
        console.log(tableContent);
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
        ObjectUtils.empty(SortState);
        sortingActiveUpdate();

        update_page_number();
        updatePaginationButtonsState();
        Table.update_date_predicate(responseTableEntries);
    }

    static filter_value_clicked(event) {
        const inputElementChecked = document.getElementById(event.srcElement.id).checked;
        const filterValue = event.srcElement.nextElementSibling.innerText;
        const column = event.srcElement.parentNode.parentNode.previousElementSibling.innerText;     

        updateFilterState(column,filterValue,inputElementChecked);
        filtersActiveUpdate();
        
        if (PageState["filtersActive"]) {

            let factory = new QueryStringFactory();
            factory.
                create_date().
                create_filterstatus().
                create_filter();

            if (PageState["sortingActive"]) {
                factory.create_sort();
            }

            let urlBuilder = new URLBuilder(factory);
            let urlOrchestrator = new URLOrchestrator(urlBuilder);
            var filterURL = null;

            if (PageState["sortingActive"]) {
                filterURL = urlOrchestrator.build_sorted_view_url().url;
                request(filterURL,Table.table_response_inspector,Table.show_sorted_view);
            }
            else {
                filterURL = urlOrchestrator.build_filtered_view_url().url;   
                request(filterURL,Table.table_response_inspector,Table.show_filtered_view); 
            } 
        }

        else {
            document.getElementById("filter-container").innerHTML = "";
            document.getElementById("table-element").innerHTML = "";
            document.getElementById("pagination").remove();
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

class PaginationController {
    constructor() {
        this.stateManager = PaginationState;
        this.compute_num_pages();
        this.add_controls();
    }

    create_next_page_button() {
        let nextPageButton = document.createElement("button");
        nextPageButton.setAttribute("id","next-page");
        nextPageButton.setAttribute("class","pagination-next");
        nextPageButton.setAttribute("class","button");
        nextPageButton.textContent = "Next Page";
        return nextPageButton;        
    }

    create_previous_page_button() {
        let previousPageButton = document.createElement("button");
        previousPageButton.setAttribute("id","previous-page");
        previousPageButton.setAttribute("class","pagination-previous");
        previousPageButton.setAttribute("class","button");
        previousPageButton.setAttribute("disabled",true);
        previousPageButton.textContent = "Previous Page";
        return previousPageButton;
    }

    create_page_literal() {
        let pageLiteral = document.createElement("span");
        pageLiteral.setAttribute("id","page-literal");
        pageLiteral.textContent = "Page";
        return pageLiteral;
    }

    create_of_literal() {
        let ofLiteral = document.createElement("span");
        ofLiteral.setAttribute("id","of-literal");
        ofLiteral.textContent = "of";
        return ofLiteral;
    }

    create_current_page_indicator() {
        let currentPage = document.createElement("span");
        currentPage.setAttribute("id","current-page-indicator");
        currentPage.textContent = 1;
        return currentPage;
    }

    create_num_pages_indicator() {
        let numPages = document.createElement("span");
        numPages.setAttribute("id","num-pages-indicator");
        numPages.textContent = this.stateManager.numPages;
        return numPages;
    }

    add_controls() {
        var controlContainer = document.createElement("nav");
        controlContainer.setAttribute("id","pagination");
        controlContainer.setAttribute("class","pagination");
        controlContainer.setAttribute("role","navigation");

        let nextPageButton = this.create_next_page_button();
        let previousPageButton = this.create_previous_page_button();
        let pageLiteral = this.create_page_literal();
        let ofLiteral = this.create_of_literal();
        let currentPage = this.create_current_page_indicator();
        let numPages = this.create_num_pages_indicator();

        // insert child nodes into pagination container
        controlContainer.appendChild(previousPageButton);
        controlContainer.append(pageLiteral);
        controlContainer.appendChild(currentPage);
        controlContainer.append(ofLiteral);
        controlContainer.appendChild(numPages);
        controlContainer.appendChild(nextPageButton);

        // display control
        let tableContainer = document.getElementById("table-space");
        tableContainer.appendChild(controlContainer);
    }

    compute_num_pages() {
        const numPages = Math.ceil(TableState["numRecords"] / PaginationState["pageSize"]);
        update_state(PaginationState,{ "numPages": numPages });
    }

    update_current_page_indicator() {
        const pageNumberElement = document.getElementById("current-page-indicator");
        pageNumberElement.textContent = this.stateManager.currentPage;
        return this;
    }

    increment_page_number() {
        const paramDict = { "currentPage": Math.min(this.stateManager.currentPage + 1, this.stateManager.numPages) };
        update_state(this.stateManager,paramDict);
        return this;
    }

    update_button_state() {
        if (this.stateManager.currentPage === this.stateManager.numPages) {
            const nextButton = document.getElementById("next-page");
            this.stateManager.nextPageActive = false;
            nextButton.disabled = !this.stateManager.nextPageActive;
        }
        
        if (this.stateManager.currentPage > 1) {
            const previousButton = document.getElementById("previous-page");
            this.stateManager.previousPageActive = true;
            previousButton.disabled = !this.stateManager.previousPageActive;
        }

        if (this.stateManager.currentPage < this.stateManager.numPages) {
            const nextButton = document.getElementById("next-page");
            this.stateManager.nextPageActive = true;
            nextButton.disabled = !this.stateManager.nextPageActive;
        }
           
        if (this.stateManager.currentPage === 1) {
            const previousButton = document.getElementById("previous-page");
            this.stateManager.previousPageActive = false;
            previousButton.disabled = !this.stateManager.previousPageActive;
        }   

        return this;
    }

    update_date_predicates(data) {
        var paramDict = {
                          "nextPagePredicate":     null,
                          "previousPagePredicate": null
                        };

        if (this.stateManager.currentPage === 1) {
            paramDict.nextPagePredicate = data["rows"][data["rows"].length - 1][0];
        }

        if (this.stateManager.currentPage === this.stateManager.numPages) {
            paramDict.previousPagePredicate = data["rows"][0][0];
        }

        if ((this.stateManager.currentPage > 1) && (this.stateManager.currentPage < this.stateManager.numPages)) {
            paramDict.nextPagePredicate = data["rows"][data["rows"].length - 1][0];
            paramDict.previousPagePredicate = data["rows"][0][0];
        }

        update_state(this.stateManager, paramDict);
    }


}


class Visits {
    constructor() {
        // this.add_event_listeners();
        this.invoke_data_retrieval(1);
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
    }

    static visits_response_inspector(event,response_handler,response) {
        const responseJSON = JSON.parse(response);
        console.log(responseJSON);
        if (responseJSON.hasOwnProperty("error")) {
            alert(`${responseJSON["error"]}`);
            throw new Error(`${responseJSON["error"]}`);
        }

        else {
            response_handler(event,responseJSON);
        }
    }

    static fetch_logs(event,start_date,end_date) {
        DateRangeState["startDate"] = start_date;//document.getElementById("start-date").value;
        DateRangeState["endDate"] = end_date;//document.getElementById("end-date").value;
        validate_date_input(DateRangeState);

        let factory = new QueryStringFactory();
        factory.create_date();

        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let url = urlOrchestrator.build_generic_url().url;

        request(url,this.visits_response_inspector,this.visits_response_handler);
    }

    invoke_data_retrieval(event) {
        Visits.fetch_logs(event,"","");
    }
}

