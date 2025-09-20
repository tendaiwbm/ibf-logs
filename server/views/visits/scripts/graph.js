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
	
	// perform a d3.nest()-like reformatting on the data 
	// separate numbers with count > 0, only these should have dots
	let interactionsReformatted = [];
	let dottedInteractions = [];
	for (const year in interactions) {
		interactionsReformatted.push({"key": year, "values": interactions[year]});
		let dottedValues = [];
		for (var i=0;i<interactions[year].length;i++) {
			if (interactions[year][i].count > 0) {
				dottedValues.push(interactions[year][i]);
			}
		}
		dottedInteractions.push({"key": year, "values": dottedValues});
	}

	// svg element
	const canvas = d3.select("svg");

	let width = 900;
	let height = 400;

	let xScale = d3.scaleLinear().domain([1,52]).range([0,width]);
	let xAxis = d3.axisBottom().ticks(52).scale(xScale);
	canvas.append("g").call(xAxis).attr("transform",`translate(45,${height-20})`);

	let yScale = d3.scaleLinear().domain([0,800]).range([350,0]);
	let yAxis = d3.axisLeft().scale(yScale);
	canvas.append("g").call(yAxis).attr("transform","translate(45,30)");

	var years = [2024,2025];
	var color = d3.scaleOrdinal().domain(years).range(["#FCB404", "#345C32"]);

	// add lines
	canvas.append("g")
		  .attr("transform","translate(45,30)")
		  .selectAll(".line")
		  .data(interactionsReformatted)
		  .enter()
		  .append("path")
		  .attr("fill","none")
		  .attr("stroke", function(d) { return color(d.key) })
		  .attr("stroke-width",2)
		  .attr("d", function (d) {
		  			    return d3.line()
		            			 .x(d => xScale(d.week_number))
					             .y(d => yScale(d.count))
					             (d.values)
		    	     })	
	
	// add dots
	canvas.append("g")
		  .attr("transform","translate(45,30)")
		  .selectAll()
		  .data(dottedInteractions)
		  .enter()
		  .append("g")
		  .style("fill", function (d) { return color(d.key) })
		  .selectAll()
		  .data(function(d) { return d.values })
		  .enter()
		  .append("circle")
		  .attr("cx", function (d) { return xScale(d.week_number); } )
          .attr("cy", function (d) { return yScale(d.count); } )
          .attr("r", 5)

    // add x axis label
    canvas.append("text")
    	  .attr("class","x label")
    	  .attr("text-anchor","center")
     	  .attr("x", (width-450) + 15)
     	  .attr("y", height+20)
     	  .text("Week of Year")

    // add y axis label			
    canvas.append("text")
    	  .attr("class","y label")
    	  .attr("text-anchor","middle")
     	  .attr("x", -height/2)
     	  .attr("y", 10)
    	  .attr("transform","rotate(-90)")
     	  .text("Number of Interactions")

}
