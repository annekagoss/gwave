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

    for (var i=1; i<allTextLines.length-1; i++) {
        var x = parseFloat(allTextLines[i].split(',')[0])*100;
		var y = parseFloat(allTextLines[i].split(',')[1]);
        data.push({'x':x,'y':y});
    }
	renderData(data);
}
