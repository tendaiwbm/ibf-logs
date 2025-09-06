class Table {
    constructor(data) {
        this.onloadDataset = data;
        this.stateManager = TableState;
        this.sortController = new SortController();
        this.filterController = new FilterController();
        update_state(this.stateManager,{ "numRecords": data["rows"].length });
        
        // create and populate table
        let responseTableEntries = deepCopyObject(data);
        responseTableEntries["rows"] = responseTableEntries["rows"].slice(0,10);
        this.realise(responseTableEntries);

        // pagination controller creates & adds controls
        // also sets next & previous page predicates
        this.paginator = new PaginationController(responseTableEntries);

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
        console.log("fetching next page");
        let factory = new QueryStringFactory();
        factory.
            create_date().
            create_predicate("next").
            create_pagedirection("next").
            create_filterstatus().
            create_filter();

        if (PageInstances.table.stateManager.sortingActive) {
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
        
        if (PageInstances.table.stateManager.sortingActive) {
            factory.create_pagenumber().create_sort();
        }

        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let pageURL = urlOrchestrator.build_page_url().url;

        request(pageURL,this.response_inspector,this.show_previous_page);
    }

    static show_next_page(event,response) {
        console.log("showing next page");
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
            clickableColumnName.addEventListener("click",this.sortController.sort);
            
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

        window.addEventListener("click", (event) => {
                                            if (!(event.srcElement.id === "add-filter-button")) {
                                                if (!(event.srcElement.parentElement.parentElement.id === "filter-dropdown-component")) {
                                                    let filterElements = document.getElementsByClassName("filter-dropdown-control");
                                                    for (let element of filterElements) {
                                                        if (!element.hidden) {
                                                            const clickIsInsideElement = event.composedPath().includes(element);
                                                            if (!(clickIsInsideElement)) element.hidden = true;
                                                        }
                                                    }
                                                }
                                            }
                                        })    
    }

    static show_sorted_view(event,responseJSON) {
        var data = deepCopyObject(responseJSON);
        data["rows"] = data["rows"].slice(0,10);

        const table = PageInstances.table;
        table.update(data);

        update_state(table.stateManager,{ "numRecords": responseJSON["rows"].length });
        table.paginator.reset(data);
    }

    static show_filtered_view(event,responseJSON) {
        var data = deepCopyObject(responseJSON);
        data["rows"] = data["rows"].slice(0,10);

        const table = PageInstances.table;
        table.update(data);
        
        table.sortController.reset();

        update_state(table.stateManager,{ "numRecords": responseJSON["rows"].length });
        table.paginator.reset(data);
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
}

class FilterController {
    constructor() {
        this.stateManager = FilterState;
        this.create_dropdown_component();
        this.dropdownDisplayed = false;
        this.countryNamesDisplayed = false;
        this.stateNamesDisplayed = false;
        this.fetch_filter_values("ClientCountryOrRegion",this.create_country_names_component.bind(this));
        this.fetch_filter_values("ClientStateOrProvince",this.create_state_names_component.bind(this));
        this.fetch_filter_values("ClientCity",this.create_city_names_component.bind(this));
        this.fetch_filter_values("ClientOS",this.create_os_names_component.bind(this));
        this.fetch_filter_values("ClientBrowser",this.create_browser_names_component.bind(this));
        this.fetch_filter_values("ClientModel",this.create_model_names_component.bind(this));
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
        filterValuesComponent.setAttribute("class","filter-dropdown-control");
        filterValuesComponent.hidden = true;

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

        let self = this;
        self.countryFilterValues = filterValuesComponent; 
        let tableContainer = document.getElementById("table-space");
        let pagination = document.getElementById("pagination");
        tableContainer.insertBefore(filterValuesComponent,pagination);

        return self;
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
            table.reset();
        }
    }

    display_country_names_options(event) {
        let table = PageInstances.table;
        let self = table.filterController;

        self.update_filter_display_status();
        self.countryFilterValues.hidden = false;
    } 

    create_state_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","state-filter-name");
        filterNameElement.textContent = "Client State or Province";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","state-filter-desc");
        filterDescElement.innerHTML = "State or province from which IBF <br> was accessed";

        this.stateFilterOption = document.createElement("button");
        this.stateFilterOption.setAttribute("id","state-filter-option");
        this.stateFilterOption.appendChild(filterNameElement);
        this.stateFilterOption.appendChild(filterDescElement);
        this.stateFilterOption.addEventListener("click",this.display_state_names_options);
    }

    create_state_names_component(states) {
        let filterValuesComponent = document.createElement("div");
        filterValuesComponent.setAttribute("id","states-filter-values");
        filterValuesComponent.setAttribute("class","filter-dropdown-control");
        filterValuesComponent.hidden = true;

        for (let i=0;i<states.values.length;i++) {
            let state = states.values[i];

            let filterValue = document.createElement("input");
            filterValue.setAttribute("type","checkbox");
            filterValue.setAttribute("class","state-filter-value");
            filterValue.setAttribute("id",state.toLowerCase());
            filterValue.addEventListener("click",FilterController.apply_state_filter);

            let filterValueLabel = document.createElement("label");
            filterValueLabel.setAttribute("for",state.toLowerCase());
            filterValueLabel.textContent = state;

            let filterValueContainer = document.createElement("div");
            filterValueContainer.appendChild(filterValue);
            filterValueContainer.appendChild(filterValueLabel);

            filterValuesComponent.appendChild(filterValueContainer);
        }
        
        let self = this;
        self.stateFilterValues = filterValuesComponent; 
        let tableContainer = document.getElementById("table-space");
        let pagination = document.getElementById("pagination");
        tableContainer.insertBefore(filterValuesComponent,pagination);

        return self;
    }

    static apply_state_filter(event) {
        const inputElementChecked = document.getElementById(event.srcElement.id).checked;
        const filterValue = event.srcElement.nextElementSibling.innerText;
        const column = "ClientStateOrProvince";
        
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
            table.reset();
        }
    }

    display_state_names_options(event) {
        let table = PageInstances.table;
        let self = table.filterController;

        self.update_filter_display_status();
        self.stateFilterValues.hidden = false;
    }

    create_city_names_component(cities) {
        let filterValuesComponent = document.createElement("div");
        filterValuesComponent.setAttribute("id","cities-filter-values");
        filterValuesComponent.setAttribute("class","filter-dropdown-control");
        filterValuesComponent.hidden = true;

        for (let i=0;i<cities.values.length;i++) {
            let city = cities.values[i];

            let filterValue = document.createElement("input");
            filterValue.setAttribute("type","checkbox");
            filterValue.setAttribute("class","city-filter-value");
            filterValue.setAttribute("id",city.toLowerCase());
            filterValue.addEventListener("click",FilterController.apply_city_filter);

            let filterValueLabel = document.createElement("label");
            filterValueLabel.setAttribute("for",city.toLowerCase());
            filterValueLabel.textContent = city;

            let filterValueContainer = document.createElement("div");
            filterValueContainer.appendChild(filterValue);
            filterValueContainer.appendChild(filterValueLabel);

            filterValuesComponent.appendChild(filterValueContainer);
        }
        
        let self = this;
        self.cityFilterValues = filterValuesComponent; 
        let tableContainer = document.getElementById("table-space");
        let pagination = document.getElementById("pagination");
        tableContainer.insertBefore(filterValuesComponent,pagination);

        return self;
    }

    static apply_city_filter(event) {
        const inputElementChecked = document.getElementById(event.srcElement.id).checked;
        const filterValue = event.srcElement.nextElementSibling.innerText;
        const column = "ClientCity";
        
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
            table.reset();
        }
    }

    display_city_names_options(event) {
        let table = PageInstances.table;
        let self = table.filterController;

        self.update_filter_display_status();
        self.cityFilterValues.hidden = false;
    }

    create_city_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","city-filter-name");
        filterNameElement.textContent = "ClientCity";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","city-filter-desc");
        filterDescElement.textContent = "City from which IBF was accessed";

        this.cityFilterOption = document.createElement("button");
        this.cityFilterOption.setAttribute("id","city-filter-option");
        this.cityFilterOption.appendChild(filterNameElement);
        this.cityFilterOption.appendChild(filterDescElement);
        this.cityFilterOption.addEventListener("click",this.display_city_names_options);
    }

    create_os_names_component(platforms) {
        let filterValuesComponent = document.createElement("div");
        filterValuesComponent.setAttribute("id","os-filter-values");
        filterValuesComponent.setAttribute("class","filter-dropdown-control");
        filterValuesComponent.hidden = true;

        for (let i=0;i<platforms.values.length;i++) {
            let os = platforms.values[i];

            let filterValue = document.createElement("input");
            filterValue.setAttribute("type","checkbox");
            filterValue.setAttribute("class","os-filter-value");
            filterValue.setAttribute("id",os.toLowerCase());
            filterValue.addEventListener("click",FilterController.apply_os_filter);

            let filterValueLabel = document.createElement("label");
            filterValueLabel.setAttribute("for",os.toLowerCase());
            filterValueLabel.textContent = os;

            let filterValueContainer = document.createElement("div");
            filterValueContainer.appendChild(filterValue);
            filterValueContainer.appendChild(filterValueLabel);

            filterValuesComponent.appendChild(filterValueContainer);
        }
        
        let self = this;
        self.osFilterValues = filterValuesComponent; 
        let tableContainer = document.getElementById("table-space");
        let pagination = document.getElementById("pagination");
        tableContainer.insertBefore(filterValuesComponent,pagination);

        return self;
    }

    static apply_os_filter(event) {
        const inputElementChecked = document.getElementById(event.srcElement.id).checked;
        const filterValue = event.srcElement.nextElementSibling.innerText;
        const column = "ClientOS";
        
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
            table.reset();
        }
    }

    display_os_names_options(event) {
        let table = PageInstances.table;
        let self = table.filterController;

        self.update_filter_display_status();
        self.osFilterValues.hidden = false;
    }

    create_os_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","os-filter-name");
        filterNameElement.textContent = "Client Operating System";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","os-filter-desc");
        filterDescElement.innerHTML = "Operating system on device used <br> to access IBF";

        this.osFilterOption = document.createElement("button");
        this.osFilterOption.setAttribute("id","os-filter-option");
        this.osFilterOption.appendChild(filterNameElement);
        this.osFilterOption.appendChild(filterDescElement);
        this.osFilterOption.addEventListener("click",this.display_os_names_options);
    }

    create_browser_names_component(browsers) {
        let filterValuesComponent = document.createElement("div");
        filterValuesComponent.setAttribute("id","browsers-filter-values");
        filterValuesComponent.setAttribute("class","filter-dropdown-control");
        filterValuesComponent.hidden = true;

        for (let i=0;i<browsers.values.length;i++) {
            let browser = browsers.values[i];

            let filterValue = document.createElement("input");
            filterValue.setAttribute("type","checkbox");
            filterValue.setAttribute("class","browser-filter-value");
            filterValue.setAttribute("id",browser.toLowerCase());
            filterValue.addEventListener("click",FilterController.apply_browser_filter);

            let filterValueLabel = document.createElement("label");
            filterValueLabel.setAttribute("for",browser.toLowerCase());
            filterValueLabel.textContent = browser;

            let filterValueContainer = document.createElement("div");
            filterValueContainer.appendChild(filterValue);
            filterValueContainer.appendChild(filterValueLabel);

            filterValuesComponent.appendChild(filterValueContainer);
        }
        
        let self = this;
        self.browserFilterValues = filterValuesComponent; 
        let tableContainer = document.getElementById("table-space");
        let pagination = document.getElementById("pagination");
        tableContainer.insertBefore(filterValuesComponent,pagination);

        return self;
    }

    static apply_browser_filter(event) {
        const inputElementChecked = document.getElementById(event.srcElement.id).checked;
        const filterValue = event.srcElement.nextElementSibling.innerText;
        const column = "ClientBrowser";
        
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
            table.reset();
        }
    }

    display_browser_names_options(event) {
        let table = PageInstances.table;
        let self = table.filterController;

        self.update_filter_display_status();
        self.browserFilterValues.hidden = false;
    }

    create_browser_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","browser-filter-name");
        filterNameElement.textContent = "Client Browser";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","browser-filter-desc");
        filterDescElement.innerHTML = "Browser used to access IBF";

        this.browserFilterOption = document.createElement("button");
        this.browserFilterOption.setAttribute("id","browser-filter-option");
        this.browserFilterOption.appendChild(filterNameElement);
        this.browserFilterOption.appendChild(filterDescElement);
        this.browserFilterOption.addEventListener("click",this.display_browser_names_options);
    }

    create_model_names_component(models) {
        let filterValuesComponent = document.createElement("div");
        filterValuesComponent.setAttribute("id","models-filter-values");
        filterValuesComponent.setAttribute("class","filter-dropdown-control");
        filterValuesComponent.hidden = true;

        for (let i=0;i<models.values.length;i++) {
            let model = models.values[i];

            let filterValue = document.createElement("input");
            filterValue.setAttribute("type","checkbox");
            filterValue.setAttribute("class","model-filter-value");
            filterValue.setAttribute("id",model.toLowerCase());
            filterValue.addEventListener("click",FilterController.apply_model_filter);

            let filterValueLabel = document.createElement("label");
            filterValueLabel.setAttribute("for",model.toLowerCase());
            filterValueLabel.textContent = model;

            let filterValueContainer = document.createElement("div");
            filterValueContainer.appendChild(filterValue);
            filterValueContainer.appendChild(filterValueLabel);

            filterValuesComponent.appendChild(filterValueContainer);
        }
        
        let self = this;
        self.modelFilterValues = filterValuesComponent; 
        let tableContainer = document.getElementById("table-space");
        let pagination = document.getElementById("pagination");
        tableContainer.insertBefore(filterValuesComponent,pagination);

        return self;
    }

    static apply_model_filter(event) {
        const inputElementChecked = document.getElementById(event.srcElement.id).checked;
        const filterValue = event.srcElement.nextElementSibling.innerText;
        const column = "ClientModel";
        
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
            table.reset();
        }
    }

    display_model_names_options(event) {
        let table = PageInstances.table;
        let self = table.filterController;

        self.update_filter_display_status();
        self.modelFilterValues.hidden = false;
    }

    create_model_filter_option() {
        let filterNameElement = document.createElement("div");
        filterNameElement.setAttribute("id","model-filter-name");
        filterNameElement.textContent = "Client Model";

        let filterDescElement = document.createElement("div");
        filterDescElement.setAttribute("id","model-filter-desc");
        filterDescElement.textContent = "Type of device used to access IBF";

        this.modelFilterOption = document.createElement("button");
        this.modelFilterOption.setAttribute("id","model-filter-option");
        this.modelFilterOption.appendChild(filterNameElement);
        this.modelFilterOption.appendChild(filterDescElement);
        this.modelFilterOption.addEventListener("click",this.display_model_names_options);
    }

    create_dropdown_component() {
        this.dropdownComponent = document.createElement("div");
        this.dropdownComponent.setAttribute("id","filter-dropdown-component");
        this.dropdownComponent.setAttribute("class","filter-dropdown-control");
        this.dropdownComponent.hidden = true;

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
        
        if (dropdown.hidden) {
            dropdown.hidden = false;
            let filterValueMenus = document.getElementsByClassName("filter-dropdown-control");
            for (let menu of filterValueMenus) {
                if ((!(menu.id === "filter-dropdown-component")) && (!menu.hidden)) {
                    menu.hidden = true;
                }
            }
        }

        else {
            dropdown.hidden = true;
        }

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


class SortController {
    constructor() {
        this.stateManager = SortState;
    }
    
    sort(event) {
        const sortingColumn = event.srcElement.innerText;
        SortController.update_state(sortingColumn);
        console.log(PageInstances.table.sortController.stateManager);
        
        let factory = new QueryStringFactory();
        factory.
            create_date().
            create_filterstatus().
            create_filter().
            create_sort();

        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let sortURL = urlOrchestrator.build_sorted_view_url().url;

        request(sortURL,Table.response_inspector,Table.show_sorted_view);
    }

    static update_state(column) {
        let sortController = PageInstances.table.sortController;
        if (sortController.stateManager.hasOwnProperty(column)) {
            if (sortController.stateManager.column === "desc") {
                ObjectUtils.upsert_item(sortController.stateManager,column,"asc");
            }
            else {
                ObjectUtils.upsert_item(sortController.stateManager,column,"desc");
            }
            return;
        }
        ObjectUtils.upsert_item(sortController.stateManager,column,"asc");
        PageInstances.table.stateManager.sortingActive = !ObjectUtils.is_empty(sortController.stateManager);
    }

    reset() {
        ObjectUtils.empty(table.sortController.stateManager);
        PageInstances.table.stateManager.sortingActive = false;
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