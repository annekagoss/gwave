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
var nodeGravityStrength = 200000,
    meshGravityStrength = 10000;
var distortionFactor = 300;

//====== Black Holes ======//
// The maximum sum of the Schwarzschild radii, kilometers converted to meters
var maxDiameter = 210*1000;
var scaleFactor = 0.0005; // Keep things on the screen
var radius = maxDiameter*scaleFactor;  // Used for distance of binary system
var bhRes = 40;
// Schwarzchild radii from http://hyperphysics.phy-astr.gsu.edu/hbase/Astro/blkhol.html
var bhaRadius, bhbRadius, finalRadius, finalRadiusRatio, systemRadius;
var bhaMass = 29, bhbMass = 36, finalMass = 62;
var c = 299792458;
var gravConst = 6.67408* Math.pow(10,-11); //m^3 kg^-1 s^-2
var rotationSpeed = .001;
var orbitalFreq = 75; //Hz
var amplitudeOnEarth = waveValue;
var solarMass = 1.99*Math.pow(10,30); //kg
//Range of ditances binary could have been from earth in megaparsecs
var distanceRange = [230, 570];
var averageDist = (distanceRange[0] + distanceRange[1])/2;
var metersPerParsec = 3.086*Math.pow(10,22);
var distFromEarth = averageDist*metersPerParsec;
var waveValue; //Variable for sharing the current wave value across files
var amplitudeAtCenter;

var smallMass = bhaMass;
var largeMass = finalMass;
var massForGravity = smallMass;


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

function angularVelToDegrees(velocity,radius){
    return velocity/radius;
}

function solarMassesToKilograms(mass) {
    return (mass * solarMass);
}

function schwarzRadius(mass){
 return (2 * gravConst * solarMassesToKilograms(mass)) / Math.pow(c,2)*scaleFactor;
}

function kmToM(km){
    return km*1000;
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

            var maxMag = ((distanceA-bhaRadius)+(distanceB-bhbRadius))/2;

            var minDist = Math.min(Math.abs(distanceA)-bhaRadius, Math.abs(distanceB)-bhbRadius);

		return [maxMag,newPos,minDist];
	}
	else {
		dist = Math.sqrt((x * x) + (y * y) + (z * z));
		nodeDist = {
			x : dist,
			y : dist,
			z : dist
		}

		return [dist, nodeDist, dist];
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
