// id="plot-space"



// const circle = canva.append("circle");
// circle.attr("r",75)
// 	  .attr("cx",parseFloat(canva.attr("width"))/2)
// 	  .attr("cy",+canva.attr("height")/2)
// 	  .attr("fill","#06402B");


function request_weekly_interactions() {
	let url = "http://ibf.logs:8082/api/visits/interactions-weekly";
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


	// svg element
	const canvas = d3.select("svg");
	canvas.style("border","5px dashed black");

	let width = 550;
	let height = 400;

	let xScale = d3.scaleLinear().domain([1,52]).range([0,width]);
	let xAxis = d3.axisBottom().scale(xScale);
	canvas.append("g").call(xAxis).attr("transform",`translate(30,${height})`);

	let yScale = d3.scaleLinear().domain([0,800]).range([350,0]);
	let yAxis = d3.axisLeft().scale(yScale);
	canvas.append("g").call(yAxis).attr("transform","translate(30,50)");

	const line = d3.line()
			       .x((d) => xScale(d.week_number))
			       .y((d) => yScale(d.count));

	canvas.append("g")
		  .attr("transform","translate(30,50)")
	      .attr("fill", "red")
	      .attr("stroke", "none")			
	      .selectAll()
	      .data(interactions)
	      .join("circle")		  
	      .attr("cx", (d) => xScale(d.week_number))  
	      .attr("cy", (d) => yScale(d.count))
	      .attr("r", 2.6)

	canvas.append("path").attr("transform","translate(30,50)").attr("d", line(interactions)).attr("stroke", "red").attr("fill","none");

	







	// // x and y scales
	// const xScale = d3.scaleLinear().domain([0,100]).range([0,canvas.attr("width")]);
	// const yScale = d3.scaleLinear().domain([0,1000]).range([canvas.attr("height"),0]);

	// canvas.append("g").attr("width",600).attr("height",400);

	// // x & y domains
	// // xScale.domain([d3.min(interactions,d => d.week_number),d3.max(interactions,d => d.week_number)]);
	// // yScale.domain([d3.min(interactions,d => d.count,d3.max(interactions,d => d.count)]);

	// // x and y axes
	// canvas.append("g").call(d3.axisBottom(xScale));
	// canvas.append("g").call(d3.axisLeft(yScale));
	// 				  // .ticks()

	
	
	
}
