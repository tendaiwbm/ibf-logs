function request(url,response_inspector,response_handler) {
	var requestObj = new XMLHttpRequest();
	requestObj.onreadystatechange = function(event) {
										if (requestObj.readyState === 4 && requestObj.status === 200) {
											response_inspector(event,response_handler,requestObj.response);
										}
									};
	requestObj.open("GET",url,true);
	requestObj.send();
};
