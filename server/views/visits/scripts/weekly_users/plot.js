import { graphConfig } from "./config.js"
import { LineGraph } from "../../../shared/scripts/types/line.js"


export function request_weekly_users() {
	       let url = "http://ibf.logs:8082/api/graph/visits/users-weekly";
	       var requestObj = new XMLHttpRequest();
	       requestObj.onreadystatechange = function(event) {
			   							       if (requestObj.readyState === 4 && requestObj.status === 200) {
											       plot_weekly_users(event,requestObj.response);
										       }
									       };
		   requestObj.open("GET",url,true);
	 	   requestObj.send();
}

function plot_weekly_users(event,data) {
		let interactions = JSON.parse(data).data;
		const graph = new LineGraph(interactions,graphConfig);
		graph.generate();
		 
}