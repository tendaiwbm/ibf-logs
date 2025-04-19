var BASE = "http://ibf.logs:8082/api/visits?";

function request(url,response_handler) {
	var requestObj = new XMLHttpRequest();
	requestObj.onreadystatechange = function(event) {
						if (requestObj.readyState === 4 && requestObj.status === 200) {
							response_handler(event,requestObj.response);
						}
					};
	requestObj.open("GET",url,true);
	requestObj.send();
};

