var binary;
var separationData, velocityData, minCounter, maxCounter;
var bhRes = 20;
var bhaSize = 29, bhbSize = 36, blackHoleA, blackHoleB;
var vectorA = new THREE.Vector3();
var vectorB = new THREE.Vector3();
var AmplitudePeaks = {
    h1 : [100, 400, 600, 760],
    template : [100, 400, 600, 640]
}
var nextPeak, lastPeak = 1;
var oneDeg = Math.PI/180;
var h1Enabled = true, templateEnabled = false;
var speed = 1;
var currentTransformation = "3d";

// The maximum sum of the Schwarzschild radii, kilometers converted to meters
var maxRadius = 210*1000;
var scaleFactor = 0.00125; // Keep things on the screen
var radius = maxRadius*scaleFactor;  // Used for distance of binary system
var c = 299792458;
var rotationSpeed = 0.25;

var gwData;

var merged = false;

function map (value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var Binary = function() {
    this.mesh = new THREE.Object3D();

    blackHoleA = new BlackHole(bhaSize, "a"); //Initial size in solar
    this.mesh.add(blackHoleA.mesh);

    blackHoleB = new BlackHole(bhbSize, "b"); //Initial size in solar
    this.mesh.add(blackHoleB.mesh);

    var peaks = (h1Enabled === true) ? AmplitudePeaks.h1 : AmplitudePeaks.template;
    var thisRotationDegrees = oneDeg*360/(300/speed);

    this.update = function(counter) {
        // Rotation speed is set on time until next amplitude peak
        // if (counter > peaks[0]) {
        //     for(i=1;i<peaks.length;i++) {
        //         if (counter < peaks[i]) {
        //             nextPeak = peaks[i];
        //             lastPeak = i > 0 ? peaks[i-1] : 1;
        //             var thisRotation = (nextPeak - lastPeak) / speed;
        //             thisRotationDegrees = (oneDeg*360)/thisRotation;
        //             break;
        //         }
        //     }
        // }

        var mappedVelIndex = Math.floor(map(counter, minCounter, maxCounter, 0, velocityData.length));

        if (mappedVelIndex < velocityData.length) {

            this.mesh.rotation.y -= velocityData[mappedVelIndex].velocity * rotationSpeed;

            if (currentTransformation === "3d") {
              this.mesh.rotation.x -= velocityData[mappedVelIndex].velocity * 0.5 * rotationSpeed;
            }
            else if (this.mesh.rotation.x !== 0){
              this.mesh.rotation.x = 0;
            }

            // console.log(this.mesh.rotation.y);
        }

        var mappedSepIndex = Math.floor(map(counter, minCounter, maxCounter, 0, separationData.length));

        if (mappedSepIndex < separationData.length) {
            merged = false;
            this.mesh.children[0].children[0].position.x = (separationData[mappedSepIndex].distance*radius) - radius;
            this.mesh.children[1].children[0].position.x = (separationData[mappedSepIndex].distance*radius*-1) + radius;
        }
        else {
            merged = true;
            this.mesh.children[0].children[0].position.x *= 0.1;
            this.mesh.children[1].children[0].position.x *= 0.1;
        }
    }
}

var BlackHole = function(size, name) {
    this.mesh = new THREE.Object3D();
	var geom = new THREE.SphereGeometry(size,bhRes,bhRes);
	var mat = new THREE.MeshPhongMaterial ({
		wireframe: true,
		color:Colors.white
	});
    var bh = new THREE.Mesh(geom, mat);

    bh.position.x = name === "a" ? (separationData[0].distance * radius) : (separationData[0].distance * radius *-1);

    this.mesh.add(bh);
}

function parseDataTimes() {
    // Match separation data start times with gw data start times
    separationData = jQuery.grep(separationData, function(d, i) {
		return d.seconds > separationData[separationData.length-1].seconds + startTime;
	});

    // Parse seconds to time until event, with 3 decimal places
    separationData.forEach(function(s) {
        s.seconds = parseFloat((separationData[separationData.length-1].seconds - s.seconds).toFixed(3))*-1;
    });

    // Match velocity data start times with gw data start times
    velocityData = jQuery.grep(velocityData, function(d, i) {
		return d.seconds > velocityData[separationData.length-1].seconds + startTime;
	});

    // Parse seconds to time until event, with 3 decimal places
    velocityData.forEach(function(s) {
        s.seconds = parseFloat((velocityData[velocityData.length-1].seconds - s.seconds).toFixed(3))*-1;
    });

    // Parse seconds to 3 decimal places
    gwData.forEach(function(g) {
        g.x = parseFloat((g.x).toFixed(3));
    });
}

function calibrateCounter(gwData) {
    minCounter = 1; // coutnerStart
    var positiveData = jQuery.grep(gwData, function(d, i) {
		return d.x > 0;
	});
    var max = positiveData[0];
    maxCounter = gwData.indexOf(max)-20;
}

function destroyBlackHoles() {
    gwData = [];
    scene.remove(binary.mesh);
}

function createBlackHoles(currentData) {
    gwData = currentData;
    calibrateCounter(gwData);
    parseDataTimes(gwData);
    binary = new Binary();
    binary.mesh.position.set(0,0,0);
    scene.add(binary.mesh);
}
