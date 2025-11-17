// import graphConfig
// import LineGraph


function request_avg_session_length() {
		let url = "http://ibf.logs:8082/api/graph/visits/avg-session-length";
		var requestObj = new XMLHttpRequest();
		requestObj.onreadystatechange = function(event) {
											if (requestObj.readyState === 4 && requestObj.status === 200) {
												plot_avg_session_length(event,requestObj.response);
											}
										};
		requestObj.open("GET",url,true);
		requestObj.send();
}

function plot_avg_session_length(event,data) {
		let sessionData = JSON.parse(data).data;
		const graph = new Histogram(sessionData,graphConfig);
		graph.generate();

}