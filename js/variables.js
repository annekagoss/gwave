//====== Globals ======//
var counterStart = 1,
    counterOffset,
    polarization = "plus",
    blackHoleA,
    blackHoleB,
    HEIGHT = window.innerHeight,
	  WIDTH = window.innerWidth;
var dashboardH1, dashboardTemplate, dashboardCombined;
var currentDashboard = dashboardCombined;
var speed = 2;
var intersects;

// Node Space
// Planar space wave y value needed for data multiplier
var flatAmp = 10,
    n;

//======  Data  ======//
var timeStretch = 1; //slow down data so effects can be seen
var dataScale = Math.pow(10,22);
var sampleRate = 16384;

var startTime = -.5;
var extendedStartTime = -.12;
var endTime = .02;

//====== Node and mesh movements ======//
var maxMeshDistance,meshFalloff;
//dampen movement from wave data
var dataDampen = .0001,
    planeFactor = 1;
// The maximum magnitude of movement vector
var maxNodeVec = 0.01,
    maxMeshVec = 0.01;


var initVecX, initVecY, initVecZ;
var overVecX, overVecY, overVecZ;
var bhX,bhY,bhZ;
var nodeGravityStrength = 100000,
    meshGravityStrength = 1000;
var distortionFactor = 100;

//====== Black Holes ======//
// The maximum sum of the Schwarzschild radii, kilometers converted to meters
var maxRadius = 210*1000;
var scaleFactor = 0.00125; // Keep things on the screen
var radius = maxRadius*scaleFactor;  // Used for distance of binary system
var bhRes = 40;
var bhaSize = 29, bhbSize = 36, finalSize = 62;
var c = 299792458;
var rotationSpeed = .001;
var amplitudeOnEarth = waveValue;
//Range of ditances binary could have been from earth in megaparsecs
var distanceRange = [230, 570];
var averageDist = (distanceRange[0] + distanceRange[1])/2;
var metersPerParsec = 3.086*Math.pow(10,22);
var distFromEarth = averageDist*metersPerParsec;
var waveValue; //Variable for sharing the current wave value across files
var amplitudeAtCenter;

var smallMass = bhaSize;
var largeMass = finalSize;
var massForGravity = smallMass;

// console.log(amplitudeAtCenter);

// var G = 6.674*(Math.pow(10,−11)); // gravitational constant m^3 kg^-1 s^-2
// var orbitalAngle = 1 + Math.pow(Math.cos(Math.PI/2),2); Equals Zero



// getBHDist variables declared first for speed optimization.
var threeVectorA, threeVectorB, threeVectorPoint, distanceA, distanceB, subVecA, subVecB, hypotenuseA, hypotenuseB, newPosA, newPosB, combinedX, combinedY, combinedZ, newPos, maxMag, dist, nodeDist;

function map (value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var strainNums, strainMag, newStrain;

function formatStrain(strain) {
  if (strain) {
    strainNums = strain.toString().split('e',2)[0];
    strainMag = strain.toString().split('e',2)[1];
    strainNums = parseFloat(strainNums).toFixed(3);
    strainMag = parseFloat(strainMag);
    newStrain = strainNums + " x 10<sup>"+strainMag+"</sup>"
    return newStrain;
  }
  else {
    return "0"
  }
}

function toMetersPerSecond(speed) {
    return speed * c;
}

function toPercent(decimal) {
    return (decimal*100).toFixed(1)+"<sup>%</sup>";
}

function angularVelToDegrees(speed,radius){
    return speed/sampleRate/radius;
}

// Find the distance from the black holes
function getBHDist(x, y, z) {
	if (blackHoleA && blackHoleB) {
		vectorA.setFromMatrixPosition( blackHoleA.mesh.children[0].matrixWorld );
		threeVectorA = new THREE.Vector3(vectorA.x, vectorA.y, vectorA.z);

		vectorB.setFromMatrixPosition( blackHoleB.mesh.children[0].matrixWorld );
		threeVectorB = new THREE.Vector3(vectorB.x, vectorB.y, vectorB.z);

		threeVectorPoint = new THREE.Vector3(x,y,z);

		distanceA = threeVectorPoint.distanceTo(vectorA);
		distanceB = threeVectorPoint.distanceTo(vectorB);

		subvecA = new THREE.Vector3();
	  subvecA = subvecA.subVectors(threeVectorA,threeVectorPoint);
		hypotenuseA = distanceA;
		subvecB = new THREE.Vector3();
	  subvecB = subvecB.subVectors(threeVectorB,threeVectorPoint);
		hypotenuseB = distanceB;

			subvecA = new THREE.Vector3();
	     	subvecA = subvecA.subVectors(threeVectorA,threeVectorPoint);
			hypotenuseA = distanceA;
			newPosA = {
				x: subvecA.x/hypotenuseA,
				y: subvecA.y/hypotenuseA,
				z: subvecA.z/hypotenuseA
			}

			subvecB = new THREE.Vector3();
	     		subvecB = subvecB.subVectors(threeVectorB,threeVectorPoint);

			hypotenuseB = distanceB;

			newPosB = {
				x: subvecB.x/hypotenuseB,
				y: subvecB.y/hypotenuseB,
				z: subvecB.z/hypotenuseB
			}

			combinedX = newPosA.x/distanceA + newPosB.x/distanceB;
			combinedY = newPosA.y/distanceA + newPosB.y/distanceB;
			combinedZ = newPosA.z/distanceA + newPosB.z/distanceB;

			newPos = {
				x: combinedX,
				y: combinedY,
				z: combinedZ
			}

			maxMag = (Math.min(Math.abs(distanceA), Math.abs(distanceB)) === Math.abs(distanceA)) ? distanceA : distanceB;

            maxMag = (distanceA+distanceB)/2;

		return [maxMag,newPos];
	}
	else {
		dist = Math.sqrt((x * x) + (y * y) + (z * z));
		nodeDist = {
			x : dist,
			y : dist,
			z : dist
		}
		return [dist, nodeDist];
	}
}

function getInitialDist(initX, initY, initZ, x, y, z) {
		var initialVector = new THREE.Vector3(initX, initY, initZ);
		var currentVector = new THREE.Vector3(x,y,z);

		var distance = currentVector.distanceTo(initialVector);

		var subvec = new THREE.Vector3();
	  subvec = subvec.subVectors(initialVector,currentVector);

		var newPos = {
			x: subvec.x/distance,
			y: subvec.y/distance,
			z: subvec.z/distance
		}

		return [distance,newPos];
}
