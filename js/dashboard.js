var dashboardH1, dashboardTemplate;

var Dashboard =  function(data, graphTitle, setName, counterOffset) {

  this.name = setName;

  var margin = {top: 20, right: 60, bottom: 20, left: 60},
      width = window.innerWidth*1 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom,
      iconWidth = 100,
      iconHeight = 33;

  var x = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, function(d) { return d.x; }));

  var y = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(data, function(d) { return d.y; }));

  var iconX = d3.scaleLinear()
      .range([0, iconWidth])
      .domain(d3.extent(data, function(d) { return d.x; }));

  var iconY = d3.scaleLinear()
      .range([iconHeight, 0])
      .domain(d3.extent(data, function(d) { return d.y; }));

  var line = d3.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });

  var iconLine = d3.line()
      .x(function(d) { return iconX(d.x); })
      .y(function(d) { return iconY(d.y); });

  if (this.name === "template") {

    var graphContainer = d3.select(".graph-section").append("div")
      .attr("class", "graph-container graph-container-1 "+this.name);

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

    var iconSvg = d3.select(".template-icon").append("svg")
        .attr("class", "graph icon")
        .attr("width", iconWidth)
        .attr("height", iconHeight)
        .append("g");

    iconSvg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", iconLine);
  }
  else {
    var graphContainer = d3.select(".graph-section").append("div")
      .attr("class", "graph-container graph-container-2 "+this.name);

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

      var iconSvg = d3.select(".h1-icon").append("svg")
          .attr("class", "graph icon")
          .attr("width", iconWidth)
          .attr("height", iconHeight)
          .append("g");

      iconSvg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", iconLine);
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

    this.updatePosition = function(phase) {
        if (currentRenderStyle === "nodes" && currentTransformation === "2d" && this.name === "template") {
            counterOffset = 190;
        }
        else if (currentRenderStyle === "nodes" && currentTransformation === "3d" && this.name === "template") {
            counterOffset = 40;
        }
        else if (currentRenderStyle === "mesh" && this.name === "template") {
            counterOffset = 20;
        }
      if ((phase+counterOffset-1) < data.length) {
          var posX = x(data[phase+counterOffset-1].x);
      }
      else {
          var posX = x(data[0].x);
      }
      svg.select(".scrub-line")
        .attr("x1", posX)
        .attr("x2", posX);
    }
}


function renderDataDashboard(data, title, setName) {
  if (setName === "h1") {
    dashboardH1 = new Dashboard(data, title, setName, 40);
  }
  else if (setName === "template") {
    dashboardTemplate = new Dashboard(data, title, setName, 40);
  }
}
