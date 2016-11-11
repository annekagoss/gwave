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

// Node Space
// Planar space wave y value needed for data multiplier
var flatAmp = 10,
    n;

//======  Data  ======//
var timeStretch = 100; //slow down data so effects can be seen
var dataScale = Math.pow(10,22);

var startTime = -5;
var extendedStartTime = -15;
var endTime = 2;

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
var nodeGravityStrength = 1000000,
    meshGravityStrength = 25000;
var distortionFactor = 0.0005;


// getBHDist variables declared first for speed optimization.
var threeVectorA, threeVectorB, threeVectorPoint, distanceA, distanceB, subVecA, subVecB, hypotenuseA, hypotenuseB, newPosA, newPosB, combinedX, combinedY, combinedZ, newPos, maxMag, dist, nodeDist;

function map (value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
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

			maxMag = (Math.max(Math.abs(distanceA), Math.abs(distanceB)) === Math.abs(distanceA)) ? distanceA : distanceB;
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
