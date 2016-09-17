var datasets = [];

function loadData() {

	function loadCSVs() {
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
		loadAudioFile1();
	}

	function audioSubmit() {
		var form = document.getElementById('file-form');
		var fileSelect = document.getElementById('file-select');
		var uploadButton = document.getElementById('upload-button');

		form.onsubmit = function(event) {
  		event.preventDefault();
		  uploadButton.innerHTML = 'Uploading...';
			var file = fileSelect.files[0];
			var formData = new FormData();
			console.log(file);

			if (file.type.match('audio.*')) {
				console.log(file.type);
		    formData.append('audioFile', file, file.name);
		  }
			xmlLoad(formData);
		}

		function xmlLoad(fd) {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', 'handler.php', true);

			xhr.addEventListener("progress", updateProgress);
			// progress on transfers from the server to the client (downloads)
			function updateProgress (oEvent) {
			  if (oEvent.lengthComputable) {
			    var percentComplete = oEvent.loaded / oEvent.total;
			    // ...
					console.log(percentComplete);
			  } else {
					console.log('length not computable');
			    // Unable to compute progress information since the total size is unknown
			  }
			}




			xhr.onload = function () {
				console.log('xhr loaded');

				while (xhr.status !== 200) {
					console.log("xhr status: " + xhr.status);
				}

			  if (xhr.status === 200) {
			    // File(s) uploaded.
			    uploadButton.innerHTML = 'Upload';
					var audioData = xhr.response;
					console.log(audioData);
					audioContext.decodeAudioData(audioData, function(buffer) {
						source.buffer = buffer;
						processAudioArray(buffer.getChannelData(0), 'h1', audioData);
					});
			  } else {
			    console.log('An error occurred!');
			  }

				xhr.send(formData);
			}
		}
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
				processAudioArray(buffer.getChannelData(0), 'h1', 'vectortransfer.mp3');
			},
			function(e){"Error with decoding audio data" + e.err});
		}
		request.send();
	}

	// loadCSVs();
	loadAudioFile();
	jQuery('#file-select').on('change', function(){
		audioSubmit();
	});
	// audioSubmit();
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

function processAudioArray(array, setName, title) {
	console.log(array);
	var data = [];
	// console.log(array);
	array.forEach(function(a, i) {
		var x = i;
		var y = a;
		data.push({'x':x,'y':y});
	});
	datasets.push({name:setName,data:data,title:title});

	datasets.forEach(function(d){
		renderDataDashboard(d.data, d.title, d.name);
	});
	retrieveDataset("h1");
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
