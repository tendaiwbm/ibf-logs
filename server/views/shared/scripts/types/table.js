import { TableState } from "../state.js"
import { SortController } from "./sorting.js"
import { FilterController } from "./filter.js"
import { PaginationController } from "./pagination.js"
import { update_state,deepCopyObject } from "../utils.js"



export class Table {
    constructor(data) {
        this.onloadDataset = data;
        this.stateManager = TableState;
        this.sortController = new SortController();
        this.filterController = new FilterController();
        update_state(this.stateManager,{ "numRecords": data["total_num_records"] });
        
        // create and populate table
        let responseTableEntries = deepCopyObject(data);
        delete responseTableEntries.total_num_records;
        this.realise(responseTableEntries);

        // pagination controller creates & adds controls
        // also sets next & previous page predicates
        this.paginator = new PaginationController(responseTableEntries, this.stateManager.numRecords);

        this.add_event_listeners();
    }

    static response_inspector(event,response_handler,response) {
        const responseJSON = JSON.parse(response);
        if (responseJSON.hasOwnProperty("message")) {
            if (responseJSON["message"] === "No records returned") {
                throw new Error(`${responseJSON["message"]}`);
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
        factory.create_date()
               .create_predicate("next")
               .create_pagedirection("next")
               .create_filterstatus()
               .create_filter();

        if (PageInstances.table.stateManager.sortingActive) {
            factory.create_pagenumber().create_sort();
        }
        
        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let pageURL = urlOrchestrator.build_page_url().url;

        let nextPageButton = document.getElementById("next-page");
        nextPageButton.classList.add("is-loading");

        request(pageURL,this.response_inspector,this.show_next_page);
    }

    static fetch_previous_page() {
        let factory = new QueryStringFactory();
        factory.create_date()
               .create_predicate("previous")
               .create_pagedirection("previous")
               .create_filterstatus()
               .create_filter();
        
        if (PageInstances.table.stateManager.sortingActive) {
            factory.create_pagenumber().create_sort();
        }

        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let pageURL = urlOrchestrator.build_page_url().url;

        let previousPageButton = document.getElementById("previous-page");
        previousPageButton.classList.add("is-loading");

        request(pageURL,this.response_inspector,this.show_previous_page);
    }

    static show_next_page(event,response) {
        const nextPageData = response;
        
        nextPageData["rows"] = nextPageData["rows"].slice(0,10);
        let table = PageInstances.table;
        table.update(nextPageData);
        
        table.paginator
             .increment_page_number()
             .update_current_page_indicator()
             .update_button_state()
             .update_date_predicates(nextPageData);

        let nextPageButton = document.getElementById("next-page");
        nextPageButton.classList.remove("is-loading");
    }

    static show_previous_page(event,response) {
        let previousPageData = response;
        
        previousPageData["rows"] = previousPageData["rows"].slice(0,10);
        let table = PageInstances.table;
        table.update(previousPageData);
        
        table.paginator
             .decrement_page_number()
             .update_current_page_indicator()
             .update_button_state()
             .update_date_predicates(previousPageData);

        let previousPageButton = document.getElementById("previous-page");
        previousPageButton.classList.remove("is-loading");
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
        tableContainer.hidden = true;
        tableContainer.appendChild(filterBar);

        let table = document.getElementById("table-element");
        this.domElement = table;
        table.appendChild(header);
        table.appendChild(body);
    }

    toggle_visibility(event) {
        let tableContainer = document.getElementById("table-space");
        let plotSpace = document.getElementById("plot-space");

        if (tableContainer.hidden) {
            tableContainer.hidden = false;
            
            plotSpace.style.height = "56%";
            plotSpace.style.overflow = "scroll";
        } 
        else {
            tableContainer.hidden = true;
            plotSpace.style.removeProperty("height");
            plotSpace.style.removeProperty("overflow");
        }
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
        document.getElementById("table-toggle").addEventListener("click",this.toggle_visibility);

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
        data.total_num_records = responseJSON["rows"].length;
        data["rows"] = data["rows"].slice(0,10);

        const table = PageInstances.table;
        table.update(data);

        update_state(table.stateManager,{ "numRecords": data.total_num_records });
        table.paginator.reset(data);
    }

    static show_filtered_view(event,responseJSON) {
        var data = deepCopyObject(responseJSON);
        data.total_num_records = responseJSON["rows"].length;
        data["rows"] = data["rows"].slice(0,10);

        const table = PageInstances.table;
        table.update(data);
        
        table.sortController.reset();

        update_state(table.stateManager,{ "numRecords": data.total_num_records });
        table.paginator.reset(data);
    }

    reset() {
        // restore onload num_records
        update_state(this.stateManager,{ "numRecords": this.onloadDataset["total_num_records"] });
        
        // clone onload data (page 1)
        let data = deepCopyObject(this.onloadDataset);

        // reset state of sorting
        ObjectUtils.empty(SortState);
        sortingActiveUpdate();

        // update table body
        this.update(data);

        // reset pagination state -> previous & next page cursors
        this.paginator.reset(data);
    }
}