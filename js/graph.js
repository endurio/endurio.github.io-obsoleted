/* STB Supply & Demand Graph */
var w_w = 20
var chart_h = 40;
var chart_w = 128;
var firstY = 20;
var stepX = 5;
var stepY = 2;
var shadowLeap = 8;
var shadowGap = 3;

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	clone() {
		return new Point(this.x, this.y);
	}
}

/* DRAW GRID */
function drawGrid(graph) {
	var graph = Snap(graph);
	var g = graph.g();
	g.attr("id", "grid");

	// var line = graph.path("M0,30.5 L" + chart_w + ",30.5");
	// line.attr("class", "grid horizontal axis");
	// g.add(line);
	
	for (y = stepY / 2; y <= chart_h; y += stepY) {
		var line = graph.path(
			"M0," + y + " L" + chart_w + "," + y
		);
		line.attr("class", "grid horizontal");
		g.add(line);
	}
	for (x = stepX / 2; x <= chart_w; x += stepX) {
		var line = graph.path(
			"M" + x + "," + chart_h + " L" + x + ",0"
		);
		line.attr("class", "grid vertical");
		g.add(line);
	}
}

function drawLineGraph(graph, points, container, id) {
	var graph = Snap(graph);

	/* PARSE POINTS */
	var myPoints = [];
	var shadowPoints = [];

	function randomData() {
		var seed = 6972912;
		function random() {
			var x = Math.sin(seed++) * 10000;
			return x - Math.floor(x);
		}

		var resolution = 512;
		var vibration = 1;

		var windowSize = 0;
		var lastPoint = new Point(0, firstY);
		var lastShadowPoint = new Point(0, firstY * 195 / 200);

		for (i = 0; i < resolution; ++i) {
			x = lastPoint.x;
			y = lastPoint.y;

			// calculate new p
			x += chart_w / resolution;
			y += random() * vibration * 2 - vibration;
			if (y > chart_h) {
				y = chart_h;
			} else if (y < 0) {
				y = 0;
			}

			if (windowSize <= 0 && x > w_w) {
				windowSize = i;
				console.log("WINDOW: count = " + windowSize + " @ (" + x + ", " + y + ")");
			}

			if (i > resolution * 4 / 5) {
				// wrap condition: long enough and cross the first point height
				if ((firstY < lastPoint.y && lastPoint.y < y) || (firstY > lastPoint.y && lastPoint.y > y)) {
					y = firstY;
				}
				console.log("WRAP: count = " + i + " @ (" + x + ", " + y + ")");
				// revert the the prev value for new loop ahead
				x = lastPoint.x;

				// repeat the first window of the chart to the end to create looping animation
				for (j = 0; j < windowSize + shadowLeap; ++j) {
					x += chart_w / resolution;
					y = myPoints[j].y;
					myPoints.push(new Point(x, y));

					if (j % shadowLeap == 0) {
						lastShadowPoint = new Point(x, shadowPoints[j/shadowLeap].y);
						shadowPoints.push(lastShadowPoint);
					}
				}

				console.log("END: count = " + (i+j) + " @ (" + x + ", " + y + ")");
				break;
			}

			// save the new Point into the array
			lastPoint = new Point(x, y);
			myPoints.push(lastPoint);

			if (i % shadowLeap == 0) {
				var gap = (y - lastShadowPoint.y) / shadowGap;
				lastShadowPoint = new Point(x, lastShadowPoint.y + gap);
				shadowPoints.push(lastShadowPoint);
			}
		}
	}

	function createSegments(p_array) {
		var segments = [];
		for (i = 0; i < p_array.length; i++) {
			var seg = "L" + p_array[i].x + "," + p_array[i].y;
			if (i === 0) {
				seg = "M" + p_array[i].x + "," + p_array[i].y;
			}
			segments.push(seg);
		}
		return segments;
	}

	function joinLine(segments_array, id) {
		var line = segments_array.join(" ");
		var line = graph.path(line);
		line.attr("id", "graph-" + id);
		var lineLength = line.getTotalLength();

		line.attr({
			"stroke-dasharray": lineLength,
			"stroke-dashoffset": lineLength
		});
	}

	randomData();

	var supply = createSegments(shadowPoints);
	joinLine(supply, id + 1);

	var demands = createSegments(myPoints);
	joinLine(demands, id);
}

$(window).on("load", function() {
	drawGrid('#chart-1');
	drawLineGraph("#chart-1", null, "#graph-1-container", 1);
});
