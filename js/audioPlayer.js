var audioA = document.getElementById('audioA') || new Audio();
var audioB;

var speedFactor = 0.84;

function loadSoundA(url) {
	console.log('load sound');
	audioA.src = url;
	// audioA.loop = true;
	// setRate(speed);
	audioA.play();
}

// function setRate(speed) {
// 	if (data) {
// 		var rate = speed*0.00079;
// 		console.log(rate);
// 		audioA.playbackRate = rate;
// 	}
// 	console.log(audioA.playbackRate);
// }

function updateAudioTrack(dataPos) {
	// console.log(dataPos);
	// console.log(audioA.currentTime);
	// console.log(audioA.currentTime / audioA.duration);
	var newTime = audioA.duration * dataPos * speedFactor;
	// console.log(newTime);
	if (newTime) {
		audioA.currentTime = newTime;
	}
}
