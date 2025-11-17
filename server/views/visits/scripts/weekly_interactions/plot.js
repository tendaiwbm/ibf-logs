// import graph config
// import LineGraph

function request_weekly_interactions() {
		let url = "http://ibf.logs:8082/api/graph/visits/interactions-weekly";
		var requestObj = new XMLHttpRequest();
		requestObj.onreadystatechange = function(event) {
											if (requestObj.readyState === 4 && requestObj.status === 200) {
												plot_weekly_interactions(event,requestObj.response);
											}
										};
		requestObj.open("GET",url,true);
		requestObj.send();
}

function plot_weekly_interactions(event,data) {
		let interactions = JSON.parse(data).data;
		const graph = new LineGraph(interactions,graphConfig);
		graph.generate();
}