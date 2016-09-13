var datasets = [];

function loadData() {
	$.ajax({
        type: "GET",
        url: "data/H1_whitened_16384hz.csv",
        dataType: "text",
        success: function(data) { processData(data, "h1"); },
		error: function(req, status, err) {console.log(status, err);}
   });

	 $.ajax({
         type: "GET",
 				 url: "data/template_downsampled.csv",
         dataType: "text",
         success: function(data) { processData(data, "template");
		 setTimeout(function(){
			 datasets.forEach(function(d){
				 renderDataDashboard(d.data, d.title, d.name);
			 });
			 retrieveDataset("h1")
		 },100);
		 ;},
 		error: function(req, status, err) {console.log(status, err);}
      });
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
			return d.x > -15 && d.x < 5;
		});
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
