// import graphConfig
// import LineGraph

function request_monthly_users() {
		let url = "http://ibf.logs:8082/api/graph/visits/users-monthly";
		var requestObj = new XMLHttpRequest();
		requestObj.onreadystatechange = function(event) {
																				if (requestObj.readyState === 4 && requestObj.status === 200) {
																					plot_monthly_users(event,requestObj.response);
																				}
																		};
		requestObj.open("GET",url,true);
		requestObj.send();
}

function plot_monthly_users(event,data) {
		let interactions = JSON.parse(data).data;
		const graph = new LineGraph(interactions,graphConfig);
		graph.generate();

}