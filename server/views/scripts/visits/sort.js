class SortingHandler {
	constructor() {
		this.stateManager = { };
	}

	static update_state_manager(column) {
		var stateManager = PageInstances.sortingHandler.stateManager;
		if (stateManager.hasOwnProperty(column)) {
			if (stateManager[column] === "desc") {
				stateManager[column] = "asc";
			}
			else if (stateManager[column] === "asc") {
				stateManager[column] = "desc";
			}
			return;
		}
		stateManager[column] = "desc";
	}

	sort(event) {
		const sortingColumn = event.srcElement.innerText;
		SortingHandler.update_state_manager(sortingColumn);
	} 

}