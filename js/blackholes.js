var binary;
var separationData, velocityData, minCounter, maxCounter;
var bhRes = 20;
var bhaSize = 29, bhbSize = 36;

// The maximum sum of the Schwarzschild radii, kilometers converted to meters
var maxRadius = 210*1000;
var scaleFactor = 0.00125; // Keep things on the screen
var radius = maxRadius*scaleFactor;  // Used for distance of binary system
var c = 299792458;

function map (value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var Binary = function() {
    this.mesh = new THREE.Object3D();

    var blackHoleA = new BlackHole(bhaSize, "a"); //Initial size in solar
    this.mesh.add(blackHoleA.mesh);

    var blackHoleB = new BlackHole(bhbSize, "b"); //Initial size in solar
    this.mesh.add(blackHoleB.mesh);

    this.update = function(counter) {
        var mappedVelIndex = Math.floor(map(counter, minCounter, maxCounter, 0, velocityData.length));

        if (mappedVelIndex < velocityData.length) {
            this.mesh.rotation.y += velocityData[mappedVelIndex].velocity*0.25;

            var mappedSepIndex = Math.floor(map(counter, minCounter, maxCounter, 0, separationData.length));

            this.mesh.children[0].children[0].position.x = (separationData[mappedSepIndex].distance*radius) - radius;
            this.mesh.children[1].children[0].position.x = (separationData[mappedSepIndex].distance*radius*-1) + radius;

            console.log(this.mesh.children[0].children[0].position.x);
        }
        else {
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

function getStartTimes() {
    // Match separation data start times with gw data start times
    separationData = jQuery.grep(separationData, function(d, i) {
		return d.seconds > separationData[separationData.length-1].seconds + startTime;
	});

    velocityData = jQuery.grep(velocityData, function(d, i) {
		return d.seconds > velocityData[separationData.length-1].seconds + startTime;
	});
}

function calibrateCounter(gwData) {
    minCounter = 1; // coutnerStart
    var positiveData = jQuery.grep(gwData, function(d, i) {
		return d.x > 0;
	});
    var max = positiveData[0];
    maxCounter = gwData.indexOf(max);
}

function createBlackHoles(currentData) {
    gwData = currentData;
    calibrateCounter(gwData);
    getStartTimes();


    binary = new Binary();
    binary.mesh.position.set(0,0,0);
    scene.add(binary.mesh);
}
