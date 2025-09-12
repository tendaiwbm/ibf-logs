// id="plot-space"

const canva = d3.select("svg");
canva.style("border","5px dashed black");

// const circle = canva.append("circle");
// circle.attr("r",75)
// 	  .attr("cx",parseFloat(canva.attr("width"))/2)
// 	  .attr("cy",+canva.attr("height")/2)
// 	  .attr("fill","#06402B");




function plot_bar() {
	let ibfData = [];
	PageInstances.view.data.rows
					       .forEach(row => {
		       					ibfData.push(
   					 				{
   					 				 "timestamp": new Date(row[0]),
   					                 "name": row[1]
   					                }
   					            )
					       });
	console.log(ibfData);

	
}
