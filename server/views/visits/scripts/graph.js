class LineGraph {
		constructor(data,config) {
				this.data = data;
				this.config = config;
		}

		transform_data() {
				let dataReformatted = [];
				let dottedInteractions = [];

				for (const interval in this.data) {
						dataReformatted.push({"key": interval, "values": this.data[interval]});
						let dottedValues = [];

						for (var i=0;i<this.data[interval].length;i++) {
								if (this.data[interval][i].count > 0) {
									dottedValues.push(this.data[interval][i]);
								}
						}

						dottedInteractions.push({"key": interval, "values": dottedValues});
				}

				this.lineData = dataReformatted;
				this.pointData = dottedInteractions;

				return this;
		}

		#create_xaxis(dom_element,params) {
				let xScale = d3.scaleLinear().domain(params["domain"]).range(params["range"]);
				let xAxis = d3.axisBottom().ticks(params["ticks"]).scale(xScale);				

				dom_element.append("g").call(xAxis).attr("transform",`translate(${params["translation"][0]},${params["translation"][1]})`);

				this.xScale = xScale;
		}

		#create_yaxis(dom_element,params) {
				let yScale = d3.scaleLinear().domain(params["domain"]).range(params["range"]);
				let yAxis = d3.axisLeft().scale(yScale);				

				dom_element.append("g").call(yAxis).attr("transform",`translate(${params["translation"][0]},${params["translation"][1]})`);

				this.yScale = yScale;
		}

		create_axes() {
				const canvas = d3.select(this.config["domElementId"]);
				this.#create_xaxis(canvas,this.config["xScale"]);
				this.#create_yaxis(canvas,this.config["yScale"]);

				return this;
		}

		#add_xlabel(dom_element,params) {
				dom_element.append("text")
	    	  				 .attr("class","x label")
					    	   .attr("text-anchor",params["text-anchor"])
					     	   .attr("x", params["xOffset"] + params["xTranslation"])
					     	   .attr("y", params["yOffset"])
					     	   .text(params["title"])
		}

		#add_ylabel(dom_element,params) {
				dom_element.append("text")
	    	  				 .attr("class","y label")
					    	   .attr("text-anchor",params["text-anchor"])
					     	   .attr("x", params["xOffset"] + params["xTranslation"])
					     	   .attr("y", params["yOffset"])
					     	   .attr("transform","rotate(" + `${params["rotation"]}` + ")")
					     	   .text(params["title"])
		}

		add_axis_labels() {
				const canvas = d3.select(this.config["domElementId"]);
				this.#add_xlabel(canvas,this.config["xLabel"]);
				this.#add_ylabel(canvas,this.config["yLabel"]);

				return this;
		}

		add_chart_title() {
				const canvas = d3.select(this.config["domElementId"]);
				let params = this.config["chartLabel"];
		    canvas.append('text')
		          .attr('class', 'title')
		          .attr('x', params["xOffset"])
		          .attr('y', 30)
		          .attr('text-anchor', params["text-anchor"])
		          .text(params["title"])
		          .style("font-size",params["font-size"]);

		    return this;
		}

		#compute_graph_colour_scale() {
				const canvas = d3.select(this.config["domElementId"]);
				let variablesObj = this.config["legend"]["variables"];
				let variableLiterals = Object.keys(variablesObj);
				let colours = [];
				
				Object.values(variablesObj)
				      .forEach((variableLegendConfig) => { colours.push(variableLegendConfig["hex"]); });
				
				return d3.scaleOrdinal().domain(variableLiterals).range(colours);
		}

		add_lines() {
				let xColumn = this.config["xColumn"];
				let yColumn = this.config["yColumn"];
				let colourScale = this.#compute_graph_colour_scale();
				let xScale = this.xScale;
				let yScale = this.yScale;

				const canvas = d3.select(this.config["domElementId"]);
				canvas.append("g")
					    .attr("transform","translate(" + `${this.config["xTranslation"]}` + "," + `${this.config["yTranslation"]}` + ")")
					    .selectAll(".line")
					    .data(this.lineData)
					    .enter()
					    .append("path")
					    .attr("fill","none")
					    .attr("stroke", function(d) { return colourScale(d.key) })
					    .attr("stroke-width",2)
					    .attr("d", function (d) {
					  	  		    		return d3.line()
					              				  	 .x(d => xScale(d[xColumn]))
								               			 .y(d => yScale(d[yColumn]))
								                     (d.values)
					    	         })

				return this;
		}

		add_dots() {
				let xColumn = this.config["xColumn"];
				let yColumn = this.config["yColumn"];
				let colourScale = this.#compute_graph_colour_scale();
				let xScale = this.xScale;
				let yScale = this.yScale;

				const canvas = d3.select(this.config["domElementId"]);
				canvas.append("g")
					    .attr("transform","translate(" + `${this.config["xTranslation"]}` + "," + `${this.config["yTranslation"]}` + ")")
					    .selectAll()
					    .data(this.pointData)
					    .enter()
					    .append("g")
					    .style("fill", function (d) { return colourScale(d.key) })
					    .selectAll()
					    .data(function(d) { return d.values })
					    .enter()
					    .append("circle")
					    .attr("cx", function (d) { return xScale(d[xColumn]); } )
			        .attr("cy", function (d) { return yScale(d[yColumn]); } )
			        .attr("r", 5)

			  return this;
		}

		show_legend() {
				const canvas = d3.select(this.config["domElementId"]);
				let legend = canvas.append("g")
											     .attr("class", "legend")
											     .attr("transform", "translate(" + `${this.config["legend"]["xTranslation"]}` + "," + `${this.config["legend"]["yTranslation"]}` + ")")
											     .style("font-size", this.config["legend"]["font-size"]);

				let colours = this.config["legend"]["variables"];
				Object.keys(colours)
					    .forEach((colour, i) => {
														  				   legend.append("text")
															  					     .attr("y", `${i}em`)
																  				     .attr("x", "1em")
																	  			     .text(colours[colour].name);
 
  																		   legend.append("circle")
	  																		       .attr("cy", `${i - 0.25}em`)
		  																	       .attr("cx", 0)
			  																       .attr("r", "0.4em")
				  															       .attr("fill", colours[colour].hex);
					    	  										});		

		}

		generate() {
				this.transform_data()
						.create_axes()
						.add_axis_labels()
						.add_chart_title()
						.add_lines()
						.add_dots()
						.show_legend()
		}
}


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
		let chartWidth = 900;
		let chartHeight = 400;

		let graphConfig = {
											   "domElementId": "#weekly-interactions",
											   "width": chartWidth,
											   "height": chartHeight,
											   "xTranslation": 55,
											   "yTranslation": 30,
											   "xColumn": "week_number",
											   "yColumn": "count",
											   
											   "xScale": {
											   						  "domain": [1,52],
											   						  "range": [0,chartWidth],
											   						  "translation": [55,chartHeight-20],
											   						  "ticks": 52
											   					 },

											   	"yScale": {
											   						  "domain": [0,650],
											   						  "range": [350,0],
											   						  "translation": [55,30],
											   					 },

											   "xLabel": {
											   						  "title": "Week of Year",
											   						  "text-anchor": "middle",
											   							"xOffset": chartWidth/2,
											   							"xTranslation": 64,
											   							"yOffset": chartHeight + 20,
											   							"yTranslation": 0,
											   							"rotation": 0
											   					 },

											   "yLabel": {
											   							"title": "Number of Interactions",
											   							"text-anchor": "middle",
											   							"xOffset": - chartHeight/2,
											   							"xTranslation": 0,
											   							"yOffset": 15,
											   							"yTranslation": 0,
											   							"rotation": -90
											   					 },
											   
											  "chartLabel": {
											  							   "title": "Number of Interactions per Week",
											  							   "text-anchor": "middle",
								   										   "xOffset": chartWidth/1.75,
								   										   "xTranslation": 0,
								   										   "yOffset": 30,
								   										   "yTranslation": 0,
								   										   "font-size": "20px"
											                },

											  "legend": {
											  					   "xTranslation": 80,
											  					   "yTranslation": 50,
											  					   "font-size": "12px",
											  					   "variables": {
											  					   							   "2024": {"hex": "#FCB404", "name": "2024"},
											  					   							   "2025": {"hex": "#345C32", "name": "2025"}
											  					   							}
											            }
									    }

		const graph = new LineGraph(interactions,graphConfig);
		graph.generate();

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
		let chartWidth = 700;
		let chartHeight = 400;

		let graphConfig = {
											   "domElementId": "#monthly-interactions",
											   "width": chartWidth,
											   "height": chartHeight,
											   "xTranslation": 65,
											   "yTranslation": 30,
											   "xColumn": "month",
											   "yColumn": "count",
											   
											   "xScale": {
											   						  "domain": [1,12],
											   						  "range": [0,chartWidth],
											   						  "translation": [65,chartHeight-20],
											   						  "ticks": 12
											   					 },

											   "yScale": {
											   						  "domain": [0,1500],
											   						  "range": [350,0],
											   						  "translation": [65,30],
											   					 },

											   "xLabel": {
											   						  "title": "Month of Year",
											   						  "text-anchor": "middle",
											   							"xOffset": (chartWidth - 450),
											   							"xTranslation": 170,
											   							"yOffset": chartHeight ,
											   							"yTranslation": 20,
											   							"rotation": 0
											   					 },

											   "yLabel": {
											   							"title": "Number of Interactions",
											   							"text-anchor": "middle",
											   							"xOffset": - chartHeight/2,
											   							"xTranslation": 0,
											   							"yOffset": 15,
											   							"yTranslation": 0,
											   							"rotation": -90
											   					 },
											   
											  "chartLabel": {
											  							   "title": "Number of Interactions per Week",
											  							   "text-anchor": "middle",
								   										   "xOffset": chartWidth/1.65,
								   										   "xTranslation": 0,
								   										   "yOffset": 30,
								   										   "yTranslation": 0,
								   										   "font-size": "20px"
											                },

											  "legend": {
											  					   "xTranslation": 90,
											  					   "yTranslation": 50,
											  					   "font-size": "12px",
											  					   "variables": {
											  					   							   "2024": {"hex": "#FCB404", "name": "2024"},
											  					   							   "2025": {"hex": "#345C32", "name": "2025"}
											  					   							}
											            }
									    }

		const graph = new LineGraph(interactions,graphConfig);
		graph.generate();
 
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