import { SortState } from "../state/sort_state.js"

export class SortController {
    constructor() {
        this.stateManager = SortState;
    }
    
    sort(event) {
        const sortingColumn = event.srcElement.innerText;
        SortController.update_state(sortingColumn);
        
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
        ObjectUtils.empty(PageInstances.table.sortController.stateManager);
        PageInstances.table.stateManager.sortingActive = false;
    }
}