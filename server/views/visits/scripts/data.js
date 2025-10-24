class View {
    constructor() {
        this.fetch_logs();
        // console.log(this);
    }
    
    response_handler(event,response) {
        this.data = response;

        const table = new Table(response);
        PageInstances["table"] = table;
    }

    response_inspector(event,response_handler,response) {
        const responseJSON = JSON.parse(response);
        if (responseJSON.hasOwnProperty("error")) {
            alert(`${responseJSON["error"]}`);
            throw new Error(`${responseJSON["error"]}`);
        }

        else {
            response_handler(event,responseJSON);
        }
    }

    fetch_logs(start_date="",end_date="") {
        DateRangeState["startDate"] = start_date;
        DateRangeState["endDate"] = end_date;
        validate_date_input(DateRangeState);

        let factory = new QueryStringFactory();
        factory.create_date();

        let urlBuilder = new URLBuilder(factory);
        let urlOrchestrator = new URLOrchestrator(urlBuilder);
        let url = urlOrchestrator.build_generic_url().url;

        request(url,this.response_inspector.bind(this),this.response_handler.bind(this));
    }
}