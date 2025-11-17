const chartWidth = 900;
const chartHeight = 400;

const graphConfig = {
				       "domElementId": "#avg-session-length",
				       "width": chartWidth,
				       "height": chartHeight,
				       "xTranslation": 65,
				       "yTranslation": 30,
				       "xColumn": "month",
				       "yColumn": "count",
				   
				       "xScale": {
				   					"range": [0,chartWidth],
				   					"translation": [55,chartHeight-20],
				   					"ticks": 60
				   				 },

				       "yScale": {
				   					"range": [350,0],
				   					"translation": [55,30],
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

export graphConfig;			        