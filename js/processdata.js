var datasets = [], blackHoleDatasets = [];

var combinedData = [];

var timeStretch = 100; //slow down data so effects can be seen
var startTime = -10;
var endTime = 2;

function combineData(waveData) {
	// waveData = jQuery.grep(waveData, function(d, i) {
	// 	return i > waveData.length - blackHoleDatasets[0].data.length+1;
	// });
	var initialWaveSecs = parseFloat((waveData[0].x/timeStretch).toFixed(5));

	var negWaveData = jQuery.grep(waveData, function(d, i) {
		return d.x < 0;
	});

	var lengthDiff = negWaveData.length - blackHoleDatasets[0].data.length;

	// console.log(initialWaveSecs);
	// console.log()
	// waveData = jQuery.grep(waveData, function(d, i) {
	// 	return d.x;
	// });
	// console.log(initialWaveSecs);
	// console.log((parseFloat((waveData[0].x/timeStretch).toFixed(5))));

	waveData.forEach(function(w){

		// If black hole data exists, use that.  Otherwise use it's last datapoint
		var bhDataPointSeparation = blackHoleDatasets[0].data[waveData.indexOf(w)-lengthDiff] ? blackHoleDatasets[0].data[waveData.indexOf(w)-lengthDiff] : 0;

		var bhDataPointVelocity = blackHoleDatasets[1].data[waveData.indexOf(w)-lengthDiff] ? blackHoleDatasets[1].data[waveData.indexOf(w)-lengthDiff] : 0;

		var waveSecs = parseFloat((w.x/timeStretch).toFixed(5));

		combinedData.push({
			// waveSecs: parseFloat((waveSecs - initialWaveSecs).toFixed(5)),
			waveSecs: parseFloat((waveSecs).toFixed(5)),
			holeSecs:parseFloat((bhDataPointSeparation.seconds/timeStretch).toFixed(5)),
			waveVal: w.y,
			holeDist: bhDataPointSeparation.distance,
			holeVel: bhDataPointVelocity.velocity
		});
	});

	renderDataDashboard(combinedData, 'combined', 'combined');
	sendToSimulation(combinedData, 'combined');
}

function loadData() {
	function loadH1Data() {
		$.ajax({
        type: "GET",
        url: "data/H1_whitened_16384hz.csv",
        dataType: "text",
        success: function() {
        	console.log("h1 success");
        },
				error: function(req, status, err) {console.log(status, err);},
				complete: function(data) {
					console.log("h1 complete");
					processData(data.responseText, "h1");
					// datasets.forEach(function(d){
					// 	renderDataDashboard(d.data, d.title, d.name);
					// 	});
					// 	retrieveDataset("h1")
				}
	  });
	}

	function loadTemplateData() {
			$.ajax({
	         type: "GET",
	 				 url: "data/template_downsampled.csv",
	         dataType: "text",
	         success: function() {
	         		console.log("template success");
	          },
				error: function(req, status, err) {console.log(status, err);},
				complete: function(data) {
					console.log("template complete");
					processData(data.responseText, "template");
					loadH1Data();
				}
	    });
	}

	function loadVelocityData() {
		$.ajax({
        type: "GET",
        url: "data/postNewtonian-velocity.csv",
        dataType: "text",
        success: function() {
        	console.log("black hole velocity data success");
        },
		error: function(req, status, err) {console.log(status, err);},
		complete: function(data) {
			console.log("black hole velocity data complete");
			processVelocityData(data.responseText);
		}
	  });
	}

	function loadSeparationData() {
		$.ajax({
        type: "GET",
        url: "data/keplerian-separation.csv",
        dataType: "text",
        success: function() {
        	console.log("black hole separation data success");
        },
		error: function(req, status, err) {console.log(status, err);},
		complete: function(data) {
			console.log("black hole separation data complete");
			processSeparationData(data.responseText);
		}
	  });
	}

	function simulateBlackHoles(){
		sendBlackHolesToSimulation(blackHoleDatasets, function(){
			setTimeout(function(){
				simulateBlackHoles();
			},10);
		});
	}

	function loadBlackHoleData() {
		loadSeparationData();
		loadVelocityData();
		// graphBlackHoles();
		simulateBlackHoles();
	}

	loadTemplateData();
	loadBlackHoleData();
}

function processSeparationData(text) {
	var textLines = text.split(/\r\n|\n/);
	var data = [];
	for (var i=1; i<textLines.length-1; i++) {
		var s = parseFloat(textLines[i].split(',')[0])*timeStretch;
		var d = parseFloat(textLines[i].split(',')[1]);
		data.push({'seconds':s,'distance':d});
	}
	var name = "separation", title = "separation";
	blackHoleDatasets.push({name:name,data:data,title:title});
}

function processVelocityData(text) {
	var textLines = text.split(/\r\n|\n/);
	var data = [];
	for (var i=1; i<textLines.length-1; i++) {
		var s = parseFloat(textLines[i].split(',')[0])*timeStretch;
		var v = parseFloat(textLines[i].split(',')[1]);
		data.push({'seconds':s,'velocity':v});
	}
	var name = "velocity", title = "velocity";
	blackHoleDatasets.push({name:name,data:data,title:title});
}

function processData(text, setName) {
  var textLines = text.split(/\r\n|\n/);
  var headers = textLines[0].split(',');
	var data = [];

  for (var i=1; i<textLines.length-1; i++) {
      var x = parseFloat(textLines[i].split(',')[0])*timeStretch;
	var y = parseFloat(textLines[i].split(',')[1]);
      data.push({'x':x,'y':y});
  }

	data = jQuery.grep(data, function(d, i) {
		return d.x > startTime && d.x < endTime;
	});

	if (setName === "h1") {
		// var waveData = jQuery.grep(data, function(d, i) {
		// 	return d.x < 0;
		// });
		combineData(data);
	}

	var title = setName === "h1" ? "LIGO Hanford Observatory, Mon Sep 14 09:16:37 GMT 2015, 16384 Hz" : "Numerical Relativity Template";
	datasets.push({name:setName,data:data,title:title});

}

function retrieveDataset(name) {
	for (i = 0; i < datasets.length; i++) {
		if (datasets[i].name === name) {
			sendToSimulation(datasets[i].data, datasets[i].name);
		}
		else {
			continue;
		}
	}
}
