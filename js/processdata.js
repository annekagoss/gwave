var datasets = [];

function loadData() {


	function loadAudioFile1() {
			$.ajax({
	         type: "GET",
	 				 url: "data/QSine1.csv",
	         dataType: "text",
	         success: function() {
	         		console.log("qsine success");
	          },
					error: function(req, status, err) {console.log(status, err);},
					complete: function(data) {
						console.log("qsine complete");
						processData(data.responseText, "template");
						loadAudioFile2();
					}
	    });
		}

	function loadAudioFile2() {
		$.ajax({
        type: "GET",
        url: "data/DiscoBitch1.csv",
        dataType: "text",
        success: function() {
        	console.log("disco bitch success");
        },
				error: function(req, status, err) {console.log(status, err);},
				complete: function(data) {
					console.log("disco bitch complete");
					processData(data.responseText, "h1");
					datasets.forEach(function(d){
						renderDataDashboard(d.data, d.title, d.name);
			 		});
			 		retrieveDataset("h1")
				}
	  });
	}

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
					datasets.forEach(function(d){
						renderDataDashboard(d.data, d.title, d.name);
			 		});
			 		retrieveDataset("h1")
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

		// loadTemplateData();
		loadAudioFile1();
}

function processData(text, setName) {
    var textLines = text.split(/\r\n|\n/);
    var headers = textLines[0].split(',');
		var data = [];
    for (var i=1; i<textLines.length-1; i++) {
        var x = parseFloat(textLines[i].split(',')[0])*100;
		var y = parseFloat(textLines[i].split(',')[1]);
        data.push({'x':x,'y':y});
    }
		// Filter out noise data from before and after event
		// data = jQuery.grep(data, function(d, i) {
		// 	return d.x > 3000;
		// });

		if (setName === "template") {
			data.forEach(function(d){
				d.y *=0.125;
			});
		}
		var title = setName === "h1" ? "Audio File 2 (Disco Bitch)" : "Audio File 1 (QSine1)";
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
