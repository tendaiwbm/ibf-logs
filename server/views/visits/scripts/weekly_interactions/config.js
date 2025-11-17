const chartWidth = 900;
const chartHeight = 400;

const graphConfig = {
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

export graphConfig;