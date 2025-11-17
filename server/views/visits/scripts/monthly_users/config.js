const chartWidth = 700;
const chartHeight = 400;

const graphConfig = {
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

export graphConfig;		            