// response handlers for visits

function generate_table_response(event,response) {
	const x = JSON.parse(response);
	console.log(Object.keys(x).length,x);
}
