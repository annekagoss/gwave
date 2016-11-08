

var Dashboard =  function(data, graphTitle, setName, counterOffset, zoomed) {
  this.name = setName;

  // var zoomedData =

  var margin = {top: 20, right: 60, bottom: 20, left: 60},
      width = window.innerWidth*1 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom,
      iconWidth = 100,
      iconHeight = 33;

  var waveX = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, function(d) { return d.waveSecs; }));

  var waveY = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(data, function(d) { return d.waveVal; }));

  var holeX = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, function(d) { return d.waveSecs; }));

  var holeDistY = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(data, function(d) { return d.holeDist; }));

  var holeVelY = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(data, function(d) { return d.holeVel; }));

  var waveLine = d3.line()
    .x(function(d) { return waveX(d.waveSecs); })
    .y(function(d) { return waveY(d.waveVal); });

  var holeDistLine = d3.line()
    .x(function(d) { return holeX(d.waveSecs); })
    .y(function(d) { return holeDistY(d.holeDist); });

  var holeVelLine = d3.line()
    .x(function(d) { return holeX(d.waveSecs); })
    .y(function(d) { return holeVelY(d.holeVel); });

var graphContainer = d3.select(".graph-section").append("div")
  .attr("class", "graph-container graph-container "+this.name);

    var svg = d3.select(".graph-container").append("svg")
        .attr("class", "graph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
     .attr("class", "axis axis--x")
     .attr("transform", "translate(0," + (height+4) + ")")
     .call(d3.axisBottom(waveX));

   svg.append("g")
       .attr("class", "axis axis--y")
       .call(d3.axisLeft(waveY).ticks(6))
     .append("text")
       .attr("class", "axis-title")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em");

   svg.append("path")
     .datum(data)
     .attr("class", "line")
     .attr("d", waveLine);

   svg.append("path")
     .datum(data)
     .attr("class", "line")
     .attr("d", holeDistLine);

   svg.append("path")
     .datum(data)
     .attr("class", "line")
     .attr("d", holeVelLine);

   var scrubLine = svg.append("line")
    .datum(data)
    .attr("class", "scrub-line")
    .attr("x1","0")
    .attr("x2","0")
    .attr("y1","0")
    .attr("y2",height)

    this.updatePosition = function(phase) {
      if ((phase-1) < data.length) {
          var posX = waveX(data[phase-1].waveSecs);
      }
      else {
          var posX = waveX(data[0].waveSecs);
      }
      svg.select(".scrub-line")
        .attr("x1", posX)
        .attr("x2", posX);
    }
}

function renderDataDashboard(data, title, setName) {
    dashboardCombined = new Dashboard(data, title, setName, 0);
}
