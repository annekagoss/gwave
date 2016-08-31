function loadData() {
	$.ajax({
        type: "GET",
        url: "data/H1_whitened_16384hz.csv",
        dataType: "text",
        success: function(data) { processData(data); },
		error: function(req, status, err) {console.log(status, err);}
     });
}

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
		var data = [];
    for (var i=1; i<allTextLines.length-1; i++) {
        var x = parseFloat(allTextLines[i].split(',')[0])*100;
		var y = parseFloat(allTextLines[i].split(',')[1]);
        data.push({'x':x,'y':y});
    }
		// Filter out noise data from before and after event
		data = jQuery.grep(data, function(d, i) {
			return d.x > -30 && d.x < 30;
		});
		var title = "LIGO Hanford Observatory, Mon Sep 14 09:16:37 GMT 2015, 16384 Hz";
		renderDataPerspective(data);
		renderDataDashboard(data, title);
}
