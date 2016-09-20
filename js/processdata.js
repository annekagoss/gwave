var datasets = [];

function loadData() {

		function loadCSVFile() {
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
						setTimeout(function(){
							loadAudioFile();
						}, 1000);
						// datasets.forEach(function(d){
						// 	renderDataDashboard(d.data, d.title, d.name);
						// 	});
						// 	retrieveDataset("h1")
					}
		  });
		}

	// TO DO: GET THIS WORKING FOR USER-SUBMITTED AUDIO
	// function audioSubmit() {
	// 	var form = document.getElementById('file-form');
	// 	var fileSelect = document.getElementById('file-select');
	// 	var uploadButton = document.getElementById('upload-button');
	//
	// 	form.onsubmit = function(event) {
  // 		event.preventDefault();
	// 	  uploadButton.innerHTML = 'Uploading...';
	// 		var file = fileSelect.files[0];
	// 		var formData = new FormData();
	// 		console.log(file);
	//
	// 		if (file.type.match('audio.*')) {
	// 			console.log(file.type);
	// 	    formData.append('audioFile', file, file.name);
	// 	  }
	// 		xmlLoad(formData);
	// 	}
	//
	// 	function xmlLoad(fd) {
	// 		var xhr = new XMLHttpRequest();
	// 		xhr.open('POST', 'handler.php', true);
	//
	// 		xhr.addEventListener("progress", updateProgress);
	// 		// progress on transfers from the server to the client (downloads)
	// 		function updateProgress (oEvent) {
	// 		  if (oEvent.lengthComputable) {
	// 		    var percentComplete = oEvent.loaded / oEvent.total;
	// 		    // ...
	// 				console.log(percentComplete);
	// 		  } else {
	// 				console.log('length not computable');
	// 		    // Unable to compute progress information since the total size is unknown
	// 		  }
	// 		}
	//
	// 		xhr.onload = function () {
	// 			console.log('xhr loaded');
	//
	// 			while (xhr.status !== 200) {
	// 				console.log("xhr status: " + xhr.status);
	// 			}
	//
	// 		  if (xhr.status === 200) {
	// 		    // File(s) uploaded.
	// 		    uploadButton.innerHTML = 'Upload';
	// 				var audioData = xhr.response;
	// 				console.log(audioData);
	// 				audioContext.decodeAudioData(audioData, function(buffer) {
	// 					source.buffer = buffer;
	// 					processAudioArray(buffer.getChannelData(0), 'h1', audioData);
	// 				});
	// 		  } else {
	// 		    console.log('An error occurred!');
	// 		  }
	//
	// 			xhr.send(formData);
	// 		}
	// 	}
	// }

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
					loadAudioFile();
					// datasets.forEach(function(d){
					// 	renderDataDashboard(d.data, d.title, d.name);
					// 	});
					// 	retrieveDataset("h1")
				}
	  });
	}

	function loadAudioFile() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		var audioContext = new AudioContext();
		var source = audioContext.createBufferSource();
		var request = new XMLHttpRequest();
		request.open('Get', 'data/audio/vectortransfer.mp3', true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			var audioData = request.response;
			audioContext.decodeAudioData(audioData, function(buffer) {
				source.buffer = buffer;
				processAudioArray(buffer.getChannelData(0), 'audio', 'vectortransfer.mp3');
			},
			function(e){"Error with decoding audio data" + e.err});
		}
		request.send();
	}

	// loadCSVs();
	// loadH1Data();
	loadCSVFile();
	// jQuery('#file-select').on('change', function(){
	// 	audioSubmit();
	// });
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
		data = jQuery.grep(data, function(d, i) {
			return d.x > 1000;
		});
		// console.log(data);
		var title = "disco_bitch.mp3";
		// var title = setName === "h1" ? "LIGO Hanford Observatory, Mon Sep 14 09:16:37 GMT 2015, 16384 Hz" : "Numerical Relativity Template";
		datasets.push({name:setName,data:data,title:title});
}

function processAudioArray(array, setName, title) {
	var data = [];
	// array.forEach(function(a, i) {
	for (i=0; i<array.length; i++) {
		var x = i;
		var y = array[i];
		data.push({'x':x,'y':y});
	}
	datasets.push({name:setName,data:data,title:title});

	datasets.forEach(function(d){
		renderDataDashboard(d.data, d.title, d.name);
		retrieveDataset(d.name);
	});
}

function retrieveDataset(name) {

	for (i = 0; i < datasets.length; i++) {
		if (datasets[i].name === name) {
			// console.log(name);
			sendToSimulation(datasets[i].data, datasets[i].name);
		}
		else {
			continue;
		}
	}
}
