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
			  .attr("transform", function(d) { return "translate(" + (xScale(d.x0) + 55) + "," + (yScale(d.length) + 30) + ")"; })
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
