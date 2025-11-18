export class LineGraph {
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
		let xScale = d3.scaleLinear()
					   .domain(params["domain"])
					   .range(params["range"]);
		
		let xAxis = d3.axisBottom()
					  .ticks(params["ticks"])
					  .scale(xScale);				

		dom_element.append("g")
				   .call(xAxis)
				   .attr("transform",`translate(${params["translation"][0]},${params["translation"][1]})`);

		this.xScale = xScale;
	}

	#create_yaxis(dom_element,params) {
		let yScale = d3.scaleLinear()
					   .domain(params["domain"])
					   .range(params["range"]);
		
		let yAxis = d3.axisLeft()
					  .scale(yScale);				

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

	#compute_graph_colour_scale() {
		const canvas = d3.select(this.config["domElementId"]);
		let variablesObj = this.config["legend"]["variables"];
		let variableLiterals = Object.keys(variablesObj);
		let colours = [];
		
		Object.values(variablesObj)
		      .forEach((variableLegendConfig) => { colours.push(variableLegendConfig["hex"]); });
		
		return d3.scaleOrdinal()
				 .domain(variableLiterals)
				 .range(colours);
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
			  .attr("d", function (d) { return d3.line().x(d => xScale(d[xColumn])).y(d => yScale(d[yColumn]))(d.values) });

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