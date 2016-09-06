var dashboardH1, dashboardTemplate;

var Dashboard =  function(data, graphTitle) {

  var margin = {top: 20, right: 60, bottom: 20, left: 60},
      width = window.innerWidth*0.5 - margin.left - margin.right,
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

  if (jQuery('.graph-container-1').length === 0) {

    var graphContainer = d3.select(".graph-section").append("div")
      .attr("class", "graph-container graph-container-1");

    var title = d3.select(".graph-container-1").append("div")
      .attr("class","title")
      .html(graphTitle);

    var svg = d3.select(".graph-container-1").append("svg")
        .attr("class", "graph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      // .on("mouseover", function() { scrubGraph(); });
  }
  else {
    var graphContainer = d3.select(".graph-section").append("div")
      .attr("class", "graph-container graph-container-2");

    var title = d3.select(".graph-container-2").append("div")
      .attr("class","title")
      .html(graphTitle);

    var svg = d3.select(".graph-container-2").append("svg")
        .attr("class", "graph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      // .on("mouseover", function() { scrubGraph(); });
  }

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
      // console.log(data[phase]);
      var posX = x(data[phase-1].x);
      // console.log(posX);
      svg.select(".scrub-line")
        .attr("x1", posX)
        .attr("x2", posX);
    }
}


function renderDataDashboard(data, title, setName) {
  if (setName === "H1") {
    dashboardH1 = new Dashboard(data, title);
  }
  else if (setName === "Template") {
    dashboardTemplate = new Dashboard(data, title);
  }
}
