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
		const canvas = d3.select("#weekly-interactions");

		let width = 900;
		let height = 400;

		let xScale = d3.scaleLinear().domain([1,52]).range([0,width]);
		let xAxis = d3.axisBottom().ticks(52).scale(xScale);
		canvas.append("g").call(xAxis).attr("transform",`translate(55,${height-20})`);

		let yScale = d3.scaleLinear().domain([0,650]).range([350,0]);
		let yAxis = d3.axisLeft().scale(yScale);
		canvas.append("g").call(yAxis).attr("transform","translate(55,30)");

		var years = [2024,2025];
		var color = d3.scaleOrdinal().domain(years).range(["#FCB404", "#345C32"]);

		// add lines
		canvas.append("g")
			  .attr("transform","translate(55,30)")
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
			  .attr("transform","translate(55,30)")
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
	     	  .attr("y", 15)
	    	  .attr("transform","rotate(-90)")
	     	  .text("Number of Interactions")

	    // chart title
	    canvas.append('text')
	          .attr('class', 'title')
	          .attr('x', width / 1.75)
	          .attr('y', 30)
	          .attr('text-anchor', 'middle')
	          .text('Number of Interactions per Week')
	          .style("font-size","20px");

	    // legend

		let legend = canvas.append("g")
						   .attr("class", "legend")
						   .attr("transform", `translate(80, 50)`)
						   .style("font-size", "12px");

		let colors = {"2024": {"hex": "#FCB404", "name": "2024"},
					  "2025": {"hex": "#345C32", "name": "2025"}}

		Object.keys(colors).forEach((color, i) => {
		  legend
		    .append("text")
		    .attr("y", `${i}em`)
		    .attr("x", "1em")
		    .text(colors[color].name);

		  legend
		    .append("circle")
		    .attr("cy", `${i - 0.25}em`)
		    .attr("cx", 0)
		    .attr("r", "0.4em")
		    .attr("fill", colors[color].hex);
		}); 
}

function request_monthly_interactions() {
		let url = "http://ibf.logs:8082/api/graph/visits/interactions-monthly";
		var requestObj = new XMLHttpRequest();
		requestObj.onreadystatechange = function(event) {
																				if (requestObj.readyState === 4 && requestObj.status === 200) {
																					plot_monthly_interactions(event,requestObj.response);
																				}
																		};
		requestObj.open("GET",url,true);
		requestObj.send();
}

function plot_monthly_interactions(event,data) {
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
		const canvas = d3.select("#monthly-interactions");

		let width = 700;
		let height = 400;

		let xScale = d3.scaleLinear().domain([1,12]).range([0,width]);
		let xAxis = d3.axisBottom().ticks(12).scale(xScale);
		canvas.append("g").call(xAxis).attr("transform",`translate(65,${height-20})`);

		let yScale = d3.scaleLinear().domain([0,1500]).range([350,0]);
		let yAxis = d3.axisLeft().scale(yScale);
		canvas.append("g").call(yAxis).attr("transform","translate(65,30)");

		var years = [2024,2025];
		var color = d3.scaleOrdinal().domain(years).range(["#FCB404", "#345C32"]);

		// add lines
		canvas.append("g")
			  .attr("transform","translate(65,30)")
			  .selectAll(".line")
			  .data(interactionsReformatted)
			  .enter()
			  .append("path")
			  .attr("fill","none")
			  .attr("stroke", function(d) { return color(d.key) })
			  .attr("stroke-width",2)
			  .attr("d", function (d) {
			  			    return d3.line()
			            			 .x(d => xScale(d.month))
						             .y(d => yScale(d.count))
						             (d.values)
			    	     })	
		
		// add dots
		canvas.append("g")
			  .attr("transform","translate(65,30)")
			  .selectAll()
			  .data(dottedInteractions)
			  .enter()
			  .append("g")
			  .style("fill", function (d) { return color(d.key) })
			  .selectAll()
			  .data(function(d) { return d.values })
			  .enter()
			  .append("circle")
			  .attr("cx", function (d) { return xScale(d.month); } )
	          .attr("cy", function (d) { return yScale(d.count); } )
	          .attr("r", 5)

	    // add x axis label
	    canvas.append("text")
	    	  .attr("class","x label")
	    	  .attr("text-anchor","middle")
	     	  .attr("x", (width-450) + 170)
	     	  .attr("y", height+20)
	     	  .text("Month of Year")

	    // add y axis label			
	    canvas.append("text")
	    	  .attr("class","y label")
	    	  .attr("text-anchor","middle")
	     	  .attr("x", -height/2)
	     	  .attr("y", 15)
	    	  .attr("transform","rotate(-90)")
	     	  .text("Number of Interactions")

	    // chart title
	    canvas.append('text')
	          .attr('class', 'title')
	          .attr('x', width / 1.65)
	          .attr('y', 30)
	          .attr('text-anchor', 'middle')
	          .text('Number of Interactions per Month')
	          .style("font-size","20px");

	    // legend

		let legend = canvas.append("g")
						   .attr("class", "legend")
						   .attr("transform", `translate(90, 50)`)
						   .style("font-size", "12px");

		let colors = {"2024": {"hex": "#FCB404", "name": "2024"},
					  "2025": {"hex": "#345C32", "name": "2025"}}

		Object.keys(colors).forEach((color, i) => {
		  legend
		    .append("text")
		    .attr("y", `${i}em`)
		    .attr("x", "1em")
		    .text(colors[color].name);

		  legend
		    .append("circle")
		    .attr("cy", `${i - 0.25}em`)
		    .attr("cx", 0)
		    .attr("r", "0.4em")
		    .attr("fill", colors[color].hex);
		}); 
}

function request_weekly_users() {
	let url = "http://ibf.logs:8082/api/graph/visits/users-weekly";
	var requestObj = new XMLHttpRequest();
	requestObj.onreadystatechange = function(event) {
										if (requestObj.readyState === 4 && requestObj.status === 200) {
											plot_weekly_users(event,requestObj.response);
										}
									};
	requestObj.open("GET",url,true);
	requestObj.send();
}

function plot_weekly_users(event,data) {
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
		const canvas = d3.select("#weekly-users");

		let width = 900;
		let height = 400;

		let xScale = d3.scaleLinear().domain([1,52]).range([0,width]);
		let xAxis = d3.axisBottom().ticks(52).scale(xScale);
		canvas.append("g").call(xAxis).attr("transform",`translate(55,${height-20})`);

		let yScale = d3.scaleLinear().domain([0,50]).range([350,0]);
		let yAxis = d3.axisLeft().scale(yScale);
		canvas.append("g").call(yAxis).attr("transform","translate(55,30)");

		var years = [2024,2025];
		var color = d3.scaleOrdinal().domain(years).range(["#FCB404", "#345C32"]);

		// add lines
		canvas.append("g")
			  .attr("transform","translate(55,30)")
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
			  .attr("transform","translate(55,30)")
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
	     	  .attr("y", 15)
	    	  .attr("transform","rotate(-90)")
	     	  .text("Number of Unique Users")

	    // chart title
	    canvas.append('text')
	          .attr('class', 'title')
	          .attr('x', width / 1.75)
	          .attr('y', 30)
	          .attr('text-anchor', 'middle')
	          .text('Number of Unique Users per Week')
	          .style("font-size","20px");

	    // legend

		let legend = canvas.append("g")
						   .attr("class", "legend")
						   .attr("transform", `translate(80, 50)`)
						   .style("font-size", "12px");

		let colors = {"2024": {"hex": "#FCB404", "name": "2024"},
					  "2025": {"hex": "#345C32", "name": "2025"}}

		Object.keys(colors).forEach((color, i) => {
		  legend
		    .append("text")
		    .attr("y", `${i}em`)
		    .attr("x", "1em")
		    .text(colors[color].name);

		  legend
		    .append("circle")
		    .attr("cy", `${i - 0.25}em`)
		    .attr("cx", 0)
		    .attr("r", "0.4em")
		    .attr("fill", colors[color].hex);
		}); 
}

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
		const canvas = d3.select("#monthly-users");

		let width = 700;
		let height = 400;

		let xScale = d3.scaleLinear().domain([1,12]).range([0,width]);
		let xAxis = d3.axisBottom().ticks(12).scale(xScale); //.tickSizeInner(-350);
		canvas.append("g").call(xAxis).attr("transform",`translate(65,${height-20})`);

		let yScale = d3.scaleLinear().domain([0,150]).range([350,0]);
		let yAxis = d3.axisLeft().scale(yScale); //.tickSizeInner(-700);
		canvas.append("g").call(yAxis).attr("transform","translate(65,30)");

		var years = [2024,2025];
		var color = d3.scaleOrdinal().domain(years).range(["#FCB404", "#345C32"]);

		// add lines
		canvas.append("g")
			  .attr("transform","translate(65,30)")
			  .selectAll(".line")
			  .data(interactionsReformatted)
			  .enter()
			  .append("path")
			  .attr("fill","none")
			  .attr("stroke", function(d) { return color(d.key) })
			  .attr("stroke-width",2)
			  .attr("d", function (d) {
			  			    return d3.line()
			            			 .x(d => xScale(d.month))
						             .y(d => yScale(d.count))
						             (d.values)
			    	     })	
		
		// add dots
		canvas.append("g")
			  .attr("transform","translate(65,30)")
			  .selectAll()
			  .data(dottedInteractions)
			  .enter()
			  .append("g")
			  .style("fill", function (d) { return color(d.key) })
			  .selectAll()
			  .data(function(d) { return d.values })
			  .enter()
			  .append("circle")
			  .attr("cx", function (d) { return xScale(d.month); } )
	          .attr("cy", function (d) { return yScale(d.count); } )
	          .attr("r", 5)

    // add x axis label
    canvas.append("text")
    	  .attr("class","x label")
    	  .attr("text-anchor","middle")
     	  .attr("x", (width-450) + 170)
     	  .attr("y", height+20)
     	  .text("Month of Year")

    // add y axis label			
    canvas.append("text")
    	  .attr("class","y label")
    	  .attr("text-anchor","middle")
     	  .attr("x", -height/2)
     	  .attr("y", 15)
    	  .attr("transform","rotate(-90)")
     	  .text("Number of Unique Users");

    // chart title
    canvas.append('text')
          .attr('class', 'title')
          .attr('x', width / 1.65)
          .attr('y', 30)
          .attr('text-anchor', 'middle')
          .text('Number of Unique Users per Month')
          .style("font-size","20px");

    // legend
		let legend = canvas.append("g")
									     .attr("class", "legend")
									     .attr("transform", `translate(90, 50)`)
									     .style("font-size", "12px");
  
		let colors = {"2024": {"hex": "#FCB404", "name": "2024"},
					  "2025": {"hex": "#345C32", "name": "2025"}}

		Object.keys(colors).forEach((color, i) => {
		  legend
		    .append("text")
		    .attr("y", `${i}em`)
		    .attr("x", "1em")
		    .text(colors[color].name);

		  legend
		    .append("circle")
		    .attr("cy", `${i - 0.25}em`)
		    .attr("cx", 0)
		    .attr("r", "0.4em")
		    .attr("fill", colors[color].hex);
		}); 
}

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
		let maxSessionLength = sessionData.max;
		let minSessionLength = sessionData.min;
		let width = 900;
		let height = 380;

		let sessionLengths = [];
		for (var i=0;i<sessionData.avg_duration.length;i++) { 
				sessionLengths.push({"duration": sessionData.avg_duration[i]}); 
		}

		// create axes + histogram object
		var xScale = d3.scaleLinear()
									 .domain([0,maxSessionLength+1])
									 .range([0,width]);
		var xAxis = d3.axisBottom(xScale).ticks(60);

		var histogram = d3.histogram()
										  .value(function(d) { return d.duration; })
										  .domain(xScale.domain())
										  .thresholds(xScale.ticks(60));

		var bins = histogram(sessionLengths);

		var yScale = d3.scaleLinear()
									 .domain([0,d3.max(bins,function(d) { return d.length; })+5])
									 .range([height,0]);
		var yAxis = d3.axisLeft(yScale).ticks(20);

		// add axes & bars to svg element
		const canvas = d3.select("#avg-session_length");
		canvas.append("g").call(xAxis).attr("transform",`translate(50,${height+10})`);
		canvas.append("g").call(yAxis).attr("transform","translate(50,10)");

		canvas.selectAll("rect")
				  .data(bins)
				  .enter()
				  .append("rect")
				  .attr("x",1)
				  .attr("transform", function(d) { return "translate(" + (xScale(d.x0) + 50) + "," + (yScale(d.length) + 10) + ")"; })
				  .attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) - 1; })
				  .attr("height", function(d) { return height - yScale(d.length); })
				  .style("fill", "#345C32");

		// add x axis label
    canvas.append("text")
    	  .attr("class","x label")
    	  .attr("text-anchor","center")
     	  .attr("x", (width-485))
     	  .attr("y", height+50)
     	  .text("Average Duration (minutes)")

    // add y axis label			
    canvas.append("text")
    	  .attr("class","y label")
    	  .attr("text-anchor","middle")
     	  .attr("x", -height/2)
     	  .attr("y", 15)
    	  .attr("transform","rotate(-90)")
     	  .text("Number of Users")

    // chart title
    canvas.append('text')
          .attr('class', 'title')
          .attr('x', width / 1.75)
          .attr('y', 30)
          .attr('text-anchor', 'middle')
          .text('Distribution of Users\' Average Session Lengths on IBF')
          .style("font-size","20px");
}