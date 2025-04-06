// url & request for vists generated here
var BASE = "http://ibf.logs:8082/";
var API_GEO_STUB = "api/visits/";

function construct_url(param_dict) {
	var url = `${BASE}${API_GEO_STUB}?start=${param_dict["startDate"]}&end=${param_dict["endDate"]}`;
	return url;
};

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

