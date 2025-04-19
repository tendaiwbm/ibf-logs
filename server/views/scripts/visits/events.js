// events for visits

function generate_logs_table(event,start_date,end_date) {
	var dateRange = {
			 "startDate": start_date.value,
		         "endDate": end_date.value
			};
	request(construct_url(dateRange),generate_table_response);
	
};

function invoke_generate_table(event) {
	generate_logs_table(event,document.getElementById("start-date"),document.getElementById("end-date"));
};