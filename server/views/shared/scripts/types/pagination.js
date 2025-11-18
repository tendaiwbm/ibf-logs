class PaginationController {
    constructor(data,total_num_records) {
        this.stateManager = PaginationState;
        this.compute_num_pages(total_num_records);
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

    compute_num_pages(num_records) {
        const numPages = Math.ceil(num_records / PaginationState["pageSize"]);
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
        this.compute_num_pages(data["total_num_records"]);
        this.currentPageIndicator.textContent = 1;
        this.numPagesIndicator.textContent = this.stateManager.numPages;
        this.update_button_state();
        this.update_date_predicates(data);
    }
}