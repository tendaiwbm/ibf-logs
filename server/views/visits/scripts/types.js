class Table {
    constructor(data) {
        this.onloadDataset = data;
        this.stateManager = TableState;
        this.filterController = new FilterController();
        update_state(this.stateManager,{ "numRecords": data["rows"].length });
        
        // create and populate table
        let responseTableEntries = deepCopyObject(data);
        responseTableEntries["rows"] = responseTableEntries["rows"].slice(0,10);
        this.realise(responseTableEntries);

        // pagination controller creates & adds controls
        // also sets next & previous page predicates
        this.paginator = new PaginationController(responseTableEntries);

        // this.show_table_filters(this.generate_filter_dom());
        this.add_event_listeners();
    }

    static response_inspector(event,response_handler,response) {
        const responseJSON = JSON.parse(response);
        if (responseJSON.hasOwnProperty("message")) {
            if (responseJSON["message"] === "No records returned") {
                throw new Error(`${responseJSON["message"]}`);
            }
            else {
                console.log;
            }
        }

        else {
            response_handler(event,responseJSON);
        }
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
        let pageURL = urlOrchestrator.build_page_url().url;

        request(pageURL,this.response_inspector,this.show_previous_page);
    }

    static show_next_page(event,response) {
        const nextPageData = response;
        
        nextPageData["rows"] = nextPageData["rows"].slice(0,10);
        let table = PageInstances.table;
        table.update(nextPageData);
        
        table.paginator.
                        increment_page_number().
                        update_current_page_indicator().
                        update_button_state().
                        update_date_predicates(nextPageData);
    }

    static show_previous_page(event,response) {
        var previousPageData = response;
        
        previousPageData["rows"] = previousPageData["rows"].slice(0,10);
        let table = PageInstances.table;
        table.update(previousPageData);
        
        table.paginator.
                        decrement_page_number().
                        update_current_page_indicator().
                        update_button_state().
                        update_date_predicates(previousPageData);
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
        let header = this.create_header(data.columns);
        let body = this.create_body(data.rows,data.columns.length);
        let filterBar = this.filterController.create_filter_bar();

        let tableContainer = document.getElementById("table-space");
        tableContainer.appendChild(filterBar);

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
        //                                     if (this.filterController.filters_displayed) {
        //                                         let filterContainer = this.filterController.dropdownComponent;
        //                                         const insideFilterContainer = event.composedPath().includes(filterContainer);
                                                
        //                                         if (!insideFilterContainer) { 
        //                                             this.filterController.update_filter_display_status(); 
        //                                         }
        //                                     }
        //                                  })    

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
        const responseJSON = response;
        
        var data = deepCopyObject(responseJSON);
        data["rows"] = data["rows"].slice(0,10);

        const table = PageInstances.table;
        table.update(data);
        
        ObjectUtils.empty(SortState);
        sortingActiveUpdate();

        update_state(table.stateManager,{ "numRecords": responseJSON["rows"].length });
        table.paginator.reset(data);
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
            // this.reset()
        }
    }

    reset() {
        update_state(this.stateManager,{ "numRecords": this.onloadDataset["rows"].length });

        let data = deepCopyObject(this.onloadDataset);
        data.rows = data.rows.slice(0,10);

        ObjectUtils.empty(SortState);
        sortingActiveUpdate();

        this.update(data);
        this.paginator.reset(data);
    }

    invoke_filter_values_fetching(event) {
        Table.fetch_column_filter_values(event);    
    }

    invoke_sorted_view_fetching(event) {
        Table.fetch_sorted_view(event);
    }
}

class FilterController {
    constructor() {
        this.stateManager = FilterState;
        this.create_dropdown_component();
        this.dropdownDisplayed = false;
        this.
            fetch_filter_values("ClientCountryOrRegion",this.create_country_names_component);
    }

    update_filter_display_status() {
        this.#toggle_filter_dropdown();
    }

    create_filter_button() {
        let filterButton = document.createElement("button");
        filterButton.setAttribute("id","add-filter-button");
        filterButton.setAttribute("class","button");
        filterButton.textContent = "+ Filter";
        filterButton.addEventListener("click",this.#toggle_filter_dropdown);

        return filterButton;
    }

    create_time_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","time-filter-name");
        filterNameElement.textContent = "Time";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","time-filter-desc");
        filterDescElement.textContent = "Select a time range";

        this.timeFilterOption = document.createElement("div");
        this.timeFilterOption.setAttribute("id","time-filter-option");
        this.timeFilterOption.appendChild(filterNameElement);
        this.timeFilterOption.appendChild(filterDescElement);
    }

    create_country_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","country-filter-name");
        filterNameElement.textContent = "Client Country or Region";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","country-filter-desc");
        filterDescElement.innerHTML = "Country or region from which interactions <br> with IBF occurred";

        this.countryFilterOption = document.createElement("button");
        this.countryFilterOption.setAttribute("id","country-filter-option");
        this.countryFilterOption.appendChild(filterNameElement);
        this.countryFilterOption.appendChild(filterDescElement);
        this.countryFilterOption.addEventListener("click",this.display_country_names_options);
    }

    create_country_names_component(countries) {
        let filterValuesComponent = document.createElement("div");
        filterValuesComponent.setAttribute("id","countries-filter-values");

        for (let i=0;i<countries.values.length;i++) {
            let country = countries.values[i];

            let filterValue = document.createElement("input");
            filterValue.setAttribute("type","checkbox");
            filterValue.setAttribute("class","country-filter-value");
            filterValue.setAttribute("id",country.toLowerCase());
            filterValue.addEventListener("click",FilterController.apply_country_filter);

            let filterValueLabel = document.createElement("label");
            filterValueLabel.setAttribute("for",country.toLowerCase());
            filterValueLabel.textContent = country;

            let filterValueContainer = document.createElement("div");
            filterValueContainer.appendChild(filterValue);
            filterValueContainer.appendChild(filterValueLabel);

            filterValuesComponent.appendChild(filterValueContainer);
        }
        
        PageInstances.table.filterController.countryFilterValues = filterValuesComponent; 

        return PageInstances.table.filterController;
    }

    static apply_country_filter(event) {
        const inputElementChecked = document.getElementById(event.srcElement.id).checked;
        const filterValue = event.srcElement.nextElementSibling.innerText;
        const column = "ClientCountryOrRegion";
        
        FilterController.update_state(column,filterValue,inputElementChecked);
        
        let table = PageInstances.table;
        if (table.stateManager.filtersActive) {

            let factory = new QueryStringFactory();
            factory.
                create_date().
                create_filterstatus().
                create_filter();

            if (table.stateManager.sortingActive) {
                factory.create_sort();
            }

            let urlBuilder = new URLBuilder(factory);
            let urlOrchestrator = new URLOrchestrator(urlBuilder);
            var filterURL = null;

            if (table.stateManager.sortingActive) {
                filterURL = urlOrchestrator.build_sorted_view_url().url;
                request(filterURL,Table.response_inspector,Table.show_sorted_view);
            }
            else {
                filterURL = urlOrchestrator.build_filtered_view_url().url;
                request(filterURL,Table.response_inspector,Table.show_filtered_view); 
            } 
        }

        else {
            
            console.log("all filters disabled");
            table.reset();
        }
    }

    display_country_names_options(event) {
        let table = PageInstances.table;
        let self = table.filterController;

        self.update_filter_display_status();
        let tableContainer = document.getElementById("table-space");
        let pagination = document.getElementById("pagination");
        tableContainer.insertBefore(self.countryFilterValues,pagination);
    } 

    create_state_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","state-filter-name");
        filterNameElement.textContent = "Client State or Province";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","state-filter-desc");
        filterDescElement.innerHTML = "State or province from which IBF <br> was accessed";

        this.stateFilterOption = document.createElement("div");
        this.stateFilterOption.setAttribute("id","state-filter-option");
        this.stateFilterOption.appendChild(filterNameElement);
        this.stateFilterOption.appendChild(filterDescElement);
    }

    create_city_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","city-filter-name");
        filterNameElement.textContent = "Client City";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","city-filter-desc");
        filterDescElement.textContent = "City from which IBF was accessed";

        this.cityFilterOption = document.createElement("div");
        this.cityFilterOption.setAttribute("id","city-filter-option");
        this.cityFilterOption.appendChild(filterNameElement);
        this.cityFilterOption.appendChild(filterDescElement);
    }

    create_os_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","os-filter-name");
        filterNameElement.textContent = "Client Operating System";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","os-filter-desc");
        filterDescElement.innerHTML = "Operating system on device used <br> to access IBF";

        this.osFilterOption = document.createElement("div");
        this.osFilterOption.setAttribute("id","os-filter-option");
        this.osFilterOption.appendChild(filterNameElement);
        this.osFilterOption.appendChild(filterDescElement);
    }

    create_browser_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","browser-filter-name");
        filterNameElement.textContent = "Client Browser";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","browser-filter-desc");
        filterDescElement.innerHTML = "Browser used to access IBF";

        this.browserFilterOption = document.createElement("div");
        this.browserFilterOption.setAttribute("id","browser-filter-option");
        this.browserFilterOption.appendChild(filterNameElement);
        this.browserFilterOption.appendChild(filterDescElement);
    }

    create_model_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","model-filter-name");
        filterNameElement.textContent = "Client Model";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","model-filter-desc");
        filterDescElement.textContent = "Type of device used to access IBF";

        this.modelFilterOption = document.createElement("div");
        this.modelFilterOption.setAttribute("id","model-filter-option");
        this.modelFilterOption.appendChild(filterNameElement);
        this.modelFilterOption.appendChild(filterDescElement);
    }

    create_dropdown_component() {
        this.dropdownComponent = document.createElement("div");
        this.dropdownComponent.setAttribute("id","filter-dropdown-component");
        this.dropdownComponent.setAttribute("hidden",true);

        let tableContainer = document.getElementById("table-space");
        tableContainer.appendChild(this.dropdownComponent);

        this.create_time_filter_option();
        this.dropdownComponent.appendChild(this.timeFilterOption);

        this.create_country_filter_option();
        this.dropdownComponent.appendChild(this.countryFilterOption);

        this.create_state_filter_option();
        this.dropdownComponent.appendChild(this.stateFilterOption);

        this.create_city_filter_option();
        this.dropdownComponent.appendChild(this.cityFilterOption);

        this.create_os_filter_option();
        this.dropdownComponent.appendChild(this.osFilterOption);

        this.create_browser_filter_option();
        this.dropdownComponent.appendChild(this.browserFilterOption);

        this.create_model_filter_option();
        this.dropdownComponent.appendChild(this.modelFilterOption);
    }

    create_filter_bar() {
        var filterBar = document.createElement("div");
        filterBar.setAttribute("id","filter-bar");

        let filterButton = this.create_filter_button();
        filterBar.appendChild(filterButton);
        this.filterBar = filterBar;

        return filterBar;
    }

    fetch_filter_values(column,response_handler) {
        let factory = new QueryStringFactory();
        factory.
            create_date().
            create_filterstatus().
            create_filtercolumn(column);
    
        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let uniqueValuesURL = urlOrchestrator.build_filter_values_url().url;
        
        request(uniqueValuesURL,this.filter_values_response_inspector,response_handler);
    }

    filter_values_response_inspector(event,response_handler,response) {
        response_handler(JSON.parse(response));
    }

    #toggle_filter_dropdown() {
        let dropdown = PageInstances.table.filterController.dropdownComponent;
        
        if (dropdown.hidden) dropdown.hidden = false;
        else                 dropdown.hidden = true;

        PageInstances.table.filterController.dropdownDisplayed = !dropdown.hidden;
    }

    static update_state(column,filter_value,filter_value_checked) {
        let stateManager = PageInstances.table.filterController.stateManager;
        
        if (filter_value_checked) { ObjectUtils.insert_array_value(stateManager,column,filter_value); }
        else                      { ObjectUtils.remove_array_value(stateManager,column,filter_value); }

        PageInstances.table.stateManager.filtersActive = !(ObjectUtils.all_array_values_empty(stateManager));
    }
}

class PaginationController {
    constructor(data) {
        this.stateManager = PaginationState;
        this.compute_num_pages();
        this.add_controls();
        this.update_date_predicates(data);
    }

    create_next_page_button() {
        let nextPageButton = document.createElement("button");
        nextPageButton.setAttribute("id","next-page");
        nextPageButton.setAttribute("class","pagination-next");
        nextPageButton.setAttribute("class","button");
        nextPageButton.textContent = "Next Page";
        this.nextPageButton = nextPageButton;
        return nextPageButton;        
    }

    create_previous_page_button() {
        let previousPageButton = document.createElement("button");
        previousPageButton.setAttribute("id","previous-page");
        previousPageButton.setAttribute("class","pagination-previous");
        previousPageButton.setAttribute("class","button");
        previousPageButton.setAttribute("disabled",true);
        previousPageButton.textContent = "Previous Page";
        this.previousPageButton = previousPageButton;
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
        this.currentPageIndicator = currentPage;
        return currentPage;
    }

    create_num_pages_indicator() {
        let numPages = document.createElement("span");
        numPages.setAttribute("id","num-pages-indicator");
        numPages.textContent = this.stateManager.numPages;
        this.numPagesIndicator = numPages;
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
        this.currentPageIndicator.textContent = this.stateManager.currentPage;
        return this;
    }

    increment_page_number() {
        const paramDict = { "currentPage": Math.min(this.stateManager.currentPage + 1, this.stateManager.numPages) };
        update_state(this.stateManager,paramDict);
        return this;
    }

    decrement_page_number() {
        const paramDict = { "currentPage": Math.max(this.stateManager.currentPage - 1, 1) };
        update_state(this.stateManager,paramDict);
        return this;
    }

    update_button_state() {
        if (this.stateManager.currentPage === this.stateManager.numPages) {
            this.stateManager.nextPageActive = false;
            this.nextPageButton.disabled = !this.stateManager.nextPageActive;
        }
        
        if (this.stateManager.currentPage > 1) {
            this.stateManager.previousPageActive = true;
            this.previousPageButton.disabled = !this.stateManager.previousPageActive;
        }

        if (this.stateManager.currentPage < this.stateManager.numPages) {
            this.stateManager.nextPageActive = true;
            this.nextPageButton.disabled = !this.stateManager.nextPageActive;
        }
           
        if (this.stateManager.currentPage === 1) {
            this.stateManager.previousPageActive = false;
            this.previousPageButton.disabled = !this.stateManager.previousPageActive;
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

    reset(data) {
        this.stateManager.currentPage = 1;
        this.compute_num_pages();
        this.currentPageIndicator.textContent = 1;
        this.numPagesIndicator.textContent = this.stateManager.numPages;
        console.log(this.stateManager);
        this.update_button_state();
        this.update_date_predicates(data);
    }
}

class Visits {
    constructor() {
        this.invoke_data_retrieval();
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
        if (responseJSON.hasOwnProperty("error")) {
            alert(`${responseJSON["error"]}`);
            throw new Error(`${responseJSON["error"]}`);
        }

        else {
            response_handler(event,responseJSON);
        }
    }

    static fetch_logs(event,start_date,end_date) {
        DateRangeState["startDate"] = start_date;
        DateRangeState["endDate"] = end_date;
        validate_date_input(DateRangeState);

        let factory = new QueryStringFactory();
        factory.create_date();

        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let url = urlOrchestrator.build_generic_url().url;

        request(url,this.visits_response_inspector,this.visits_response_handler);
    }

    invoke_data_retrieval() {
        Visits.fetch_logs(event,"","");
    }
}

