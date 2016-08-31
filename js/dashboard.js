var dashboard;

var Dashboard =  function(data, graphTitle) {

  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 300 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  var x = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, function(d) { return d.x; }));

  var y = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(data, function(d) { return d.y; }));

  var line = d3.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });

  var graphContainer = d3.select(".ui").append("div")
    .attr("class", "graph-container");

  var title = d3.select(".graph-container").append("div")
    .attr("class","title")
    .html(graphTitle);

  var svg = d3.select(".graph-container").append("svg")
      .attr("class", "graph")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    // .on("mouseover", function() { scrubGraph(); });

  svg.append("g")
     .attr("class", "axis axis--x")
     .attr("transform", "translate(0," + (height+4) + ")")
     .call(d3.axisBottom(x));

   svg.append("g")
       .attr("class", "axis axis--y")
       .call(d3.axisLeft(y).ticks(6))
     .append("text")
       .attr("class", "axis-title")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em");

   svg.append("path")
     .datum(data)
     .attr("class", "line")
     .attr("d", line);

   var scrubLine = svg.append("line")
    .datum(data)
    .attr("class", "scrub-line")
    .attr("x1","0")
    .attr("x2","0")
    .attr("y1","0")
    .attr("y2",height)

    // jQuery(".graph").mousemove(function(event) {
    //   var mouseX = event.pageX-margin.left;
    //   svg.select(".scrub-line")
    //       .attr("x1", mouseX)
    //       .attr("x2", mouseX);
    // });

    this.updatePosition = function(phase) {
      // console.log(phase);
      var posX = x(data[phase-1].x);
      // console.log(posX);
      svg.select(".scrub-line")
        .attr("x1", posX)
        .attr("x2", posX);
    }
}


function renderDataDashboard(data, title) {
  dashboard = new Dashboard(data, title);
}
