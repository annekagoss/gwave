function loadData() {
	$.ajax({
        type: "GET",
        url: "data/H1_whitenbp.csv",
        dataType: "text",
        success: function(data) { processData(data); },
		error: function(req, status, err) {console.log(status, err);}
     });
}

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
		var data = [];
		var filterFromZero = 100;
		var cropVal = (allTextLines.length*0.5) - (filterFromZero*0.5);
		var offset = 42;
    for (var i=1; i<allTextLines.length-1; i++) {
        var x = parseFloat(allTextLines[i].split(',')[0])*100;
		var y = parseFloat(allTextLines[i].split(',')[1]);
        data.push({'x':x,'y':y});
    }
		// Filter out noise data from before and after event
		data = jQuery.grep(data, function(d, i) {
			return d.x > -30 && d.x < 30;
		});
	renderData(data);
}
