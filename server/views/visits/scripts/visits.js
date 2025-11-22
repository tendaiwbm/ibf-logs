import { request_weekly_interactions } from "./weekly_interactions/plot.js"
import { request_monthly_interactions } from "./monthly_interactions/plot.js"
import { request_weekly_users } from "./weekly_users/plot.js"
import { request_monthly_users } from "./monthly_users/plot.js"
import { request_avg_session_length } from "./average_session_length/plot.js"
import { View } from "../../shared/scripts/types/data.js"
import { ViewState,PageInstances } from "../../shared/scripts/state/view_state.js"



(function main() {
	window.PageInstances = PageInstances;
    const view = new View();
    window.PageInstances["view"] = view;

    request_weekly_interactions();
    request_monthly_interactions();
    request_weekly_users();
    request_monthly_users();
    request_avg_session_length();

})();
