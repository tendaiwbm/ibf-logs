import { FilterState } from "../state/filter_state.js"
import { URLBuilder, URLOrchestrator, QueryStringFactory } from "./url.js"
import { request } from "../request.js"

export class FilterController {
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