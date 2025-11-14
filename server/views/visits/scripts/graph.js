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

class Histogram {
		constructor(data,config) {
				this.data = data;
				this.config = config;
		}

		transform_data() {
				let bars = [];
				for (var i=0;i<this.data.values.length;i++) { 
						bars.push({"value": this.data.values[i]}); 
				}

				this.barData = bars;

				return this
		}

		#create_xaxis(dom_element,params) {
				var xScale = d3.scaleLinear()
											 .domain([0,this.data.max])
											 .range(params["range"]);
				
				var xAxis = d3.axisBottom(xScale)
				              .ticks(params["ticks"]);

				dom_element.append("g")
									 .call(xAxis)
									 .attr("transform",`translate(${params["translation"][0]},${params["translation"][1]})`);

				this.xScale = xScale;
		}

		#compute_bins() {
				var histogram = d3.histogram()
									    	  .value(function(d) { return d.value; })
							    			  .domain(this.xScale.domain())
										      .thresholds(this.xScale.ticks(this.config["xScale"]["ticks"]));

				this.barData = histogram(this.barData);
				return this.barData;
		}

		#create_yaxis(dom_element,params) {
			  let bins = this.#compute_bins();
				var yScale = d3.scaleLinear()
					  					 .domain([0,d3.max(bins,function(d) { return d.length; })])
							  			 .range(params["range"]);
				var yAxis = d3.axisLeft(yScale);				

				dom_element.append("g")
									 .call(yAxis)
									 .attr("transform",`translate(${params["translation"][0]},${params["translation"][1]})`);

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

		plot_bars() {
				let xScale = this.xScale;
				let yScale = this.yScale;
				let height = this.config["yScale"]["range"][0];
				const canvas = d3.select(this.config["domElementId"]);

				canvas.selectAll("rect")
						  .data(this.barData)
						  .enter()
						  .append("rect")
						  .attr("x",1)
						  .attr("transform", function(d) { return "translate(" + (xScale(d.x0) + 50) + "," + (yScale(d.length) + 30) + ")"; })
						  .attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) - 1; })
						  .attr("height", function(d) { return height - yScale(d.length); })
						  .style("fill", "#345C32");
		}

		generate() {
				this.transform_data()
					  .create_axes()
					  .add_axis_labels()
					  .add_chart_title()
					  .plot_bars()
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
											  							   "title": "Number of Interactions per Month",
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
		let chartWidth = 900;
		let chartHeight = 400;

		let graphConfig = {
											   "domElementId": "#weekly-users",
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
											   						  "domain": [0,50],
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
											   							"title": "Number of Users",
											   							"text-anchor": "middle",
											   							"xOffset": - chartHeight/2,
											   							"xTranslation": 0,
											   							"yOffset": 15,
											   							"yTranslation": 0,
											   							"rotation": -90
											   					 },
											   
											  "chartLabel": {
											  							   "title": "Number of Users per Week",
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
		let chartWidth = 700;
		let chartHeight = 400;

		let graphConfig = {
											   "domElementId": "#monthly-users",
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
											   						  "domain": [0,150],
											   						  "range": [350,0],
											   						  "translation": [65,30],
											   					 },

											   "xLabel": {
											   						  "title": "Month of Year",
											   						  "text-anchor": "middle",
											   							"xOffset": (chartWidth - 450),
											   							"xTranslation": 170,
											   							"yOffset": chartHeight + 20,
											   							"yTranslation": 0,
											   							"rotation": 0
											   					 },

											   "yLabel": {
											   							"title": "Number of Users",
											   							"text-anchor": "middle",
											   							"xOffset": - chartHeight/2,
											   							"xTranslation": 0,
											   							"yOffset": 15,
											   							"yTranslation": 0,
											   							"rotation": -90
											   					 },
											   
											  "chartLabel": {
											  							   "title": "Number of Users per Month",
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
		sessionData["values"] = sessionData["avg_duration"];
		delete sessionData["avg_duration"];

		let chartWidth = 900;
		let chartHeight = 400;

		let graphConfig = {
											   "domElementId": "#avg-session-length",
											   "width": chartWidth,
											   "height": chartHeight,
											   "xTranslation": 65,
											   "yTranslation": 30,
											   "xColumn": "month",
											   "yColumn": "count",
											   
											   "xScale": {
											   						  "range": [0,chartWidth],
											   						  "translation": [50,chartHeight-20],
											   						  "ticks": 60
											   					 },

											   "yScale": {
											   						  "range": [350,0],
											   						  "translation": [50,30],
											   					 },

											   "xLabel": {
											   						  "title": "Average Duration (Minutes)",
											   						  "text-anchor": "middle",
											   							"xOffset": (chartWidth - 380),
											   							"xTranslation": 0,
											   							"yOffset": chartHeight + 20,
											   							"yTranslation": 0,
											   							"rotation": 0
											   					 },

											   "yLabel": {
											   							"title": "Number of Users",
											   							"text-anchor": "middle",
											   							"xOffset": - chartHeight/2,
											   							"xTranslation": 0,
											   							"yOffset": 15,
											   							"yTranslation": 0,
											   							"rotation": -90
											   					 },

											   "chartLabel": {
											  							   "title": 'Distribution of Users\' Average Session Lengths on IBF',
											  							   "text-anchor": "middle",
								   										   "xOffset": chartWidth/1.75,
								   										   "xTranslation": 0,
								   										   "yOffset": 30,
								   										   "yTranslation": 0,
								   										   "font-size": "20px"
											                },
										  };

		const graph = new Histogram(sessionData,graphConfig);
		graph.generate();

		}