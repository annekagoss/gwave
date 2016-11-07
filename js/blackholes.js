var binary;
var mirrorA, mirrorB;
var separationData, velocityData, minCounter, maxCounter;
var bhRes = 20;
var bhaSize = 29, bhbSize = 36, finalSize = 62;
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
var currentSeparation = 1;

// The maximum sum of the Schwarzschild radii, kilometers converted to meters
var maxRadius = 210*1000;
var scaleFactor = 0.00125; // Keep things on the screen
var radius = maxRadius*scaleFactor;  // Used for distance of binary system
var c = 299792458;
// var rotationSpeed = 0.04;
var rotationSpeed = .1;

var gwData;

var merged = false;
var blackHolesCreated = false;

function map (value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var Binary = function() {
    this.mesh = new THREE.Object3D();

    mirrorA = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color: 0x777777 } );

  	mirrorB = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color: 0x777777 } );

    blackHoleA = new BlackHole(bhaSize, "a", mirrorA); //Initial size in solar
    this.mesh.add(blackHoleA.mesh);

    blackHoleB = new BlackHole(bhbSize, "b", mirrorB); //Initial size in solar
    this.mesh.add(blackHoleB.mesh);

    // var peaks = (h1Enabled === true) ? AmplitudePeaks.h1 : AmplitudePeaks.template;
    // var thisRotationDegrees = oneDeg*360/(300/speed);

    this.update = function(counter) {

        if (gwData[counter-1].waveSecs<0) {
          marged = false;


          this.mesh.rotation.y -= gwData[counter-1].holeVel * rotationSpeed;

          if (currentTransformation === "3d") {
            this.mesh.rotation.x -= gwData[counter-1].holeVel * 0.5 * rotationSpeed;
          }
          else if (this.mesh.rotation.x !== 0){
            this.mesh.rotation.x = 0;
          }

          this.mesh.children[0].children[0].position.x = (gwData[counter-1].holeDist*radius) - radius;

          this.mesh.children[1].children[0].position.x =  (gwData[counter-1].holeDist*radius*-1) + radius;
        }
        else {
          merged = true;
          this.mesh.children[0].children[0].position.x = 0;
          this.mesh.children[1].children[0].position.x = 0;
        }
    }
}

var BlackHole = function(size, name, mat) {
    this.mesh = new THREE.Object3D();
	var geom = new THREE.SphereGeometry(size,bhRes,bhRes);
    var bh = new THREE.Mesh(geom, mat.material);
    bh.add(mat);

    bh.position.x = name === "a" ? (separationData[0].distance * radius) : (separationData[0].distance * radius *-1);
    bh.position.y = (currentTransformation === "3d") ? 0 : flatAmp;

    this.mesh.add(bh);
}

function calibrateCounter(gwData) {
    minCounter = 1; // coutnerStart
    var positiveData = jQuery.grep(gwData, function(d, i) {
		return d.x > 0;
	});
    var max = positiveData[0];
    maxCounter = gwData.indexOf(max);
}

function destroyBlackHoles() {
    blackHolesCreated = false;
    blackHoleB.mesh.children[0].scale.set(bhbSize,bhbSize,bhbSize);
    // gwData = [];
    scene.remove(binary.mesh);
}

function createBlackHoles(currentData) {
    gwData = currentData ? currentData : gwData;
    calibrateCounter(gwData);
    // parseDataTimes(gwData);
    binary = new Binary();
    binary.mesh.position.set(0,0,0);
    scene.add(binary.mesh);
    setTimeout(function(){
        blackHolesCreated = true;
    },200);
}
