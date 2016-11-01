var counterStart = 1, polarization;
var nodeFactor = 5000;
var maxNodeVec = 0.01;

function getBHDist(x, y, z) {
	if (blackHoleA && blackHoleB) {

		vectorA.setFromMatrixPosition( blackHoleA.mesh.children[0].matrixWorld );
		var threeVectorA = new THREE.Vector3(vectorA.x, vectorA.y, vectorA.z);

		vectorB.setFromMatrixPosition( blackHoleB.mesh.children[0].matrixWorld );
		var threeVectorB = new THREE.Vector3(vectorB.x, vectorB.y, vectorB.z);

		var threeVectorPoint = new THREE.Vector3(x,y,z);

		var distanceA = threeVectorPoint.distanceTo(vectorA);
		var distanceB = threeVectorPoint.distanceTo(vectorB);

		var subvecA = new THREE.Vector3();
	  subvecA = subvecA.subVectors(threeVectorA,threeVectorPoint);
		var hypotenuseA = distanceA;
		var subvecB = new THREE.Vector3();
	  subvecB = subvecB.subVectors(threeVectorB,threeVectorPoint);
		var hypotenuseB = distanceB;

			var subvecA = new THREE.Vector3();
	     		subvecA = subvecA.subVectors(threeVectorA,threeVectorPoint);
			var hypotenuseA = distanceA;
			var newPosA = {
				x: subvecA.x/hypotenuseA,
				y: subvecA.y/hypotenuseA,
				z: subvecA.z/hypotenuseA
			}

			var subvecB = new THREE.Vector3();
	     		subvecB = subvecB.subVectors(threeVectorB,threeVectorPoint);

			var hypotenuseB = distanceB;

			var newPosB = {
				x: subvecB.x/hypotenuseB,
				y: subvecB.y/hypotenuseB,
				z: subvecB.z/hypotenuseB
			}

			var combinedX = newPosA.x/distanceA + newPosB.x/distanceB;
			var combinedY = newPosA.y/distanceA + newPosB.y/distanceB;
			var combinedZ = newPosA.z/distanceA + newPosB.z/distanceB;

			var newPos = {
				x: combinedX,
				y: combinedY,
				z: combinedZ
			}

		return [distanceA,newPos];
	}
	else {
		var dist = Math.sqrt((x * x) + (y * y) + (z * z));
		var nodeDist = {
			x : dist,
			y : dist,
			z : dist
		}
		return [dist, nodeDist];
	}
}

var Node = function() {
	this.mesh = new THREE.Object3D();
	var geom = new THREE.SphereGeometry(nodeParticleSize,nodeRes,nodeRes);
	var mat = new THREE.MeshPhongMaterial ({
		wireframe: true,
		color:Colors.white
	});

	var n = new THREE.Mesh(geom, mat);
	n.castShadow = true;
	n.receiveShadow = true;
	this.mesh.add(n);
	this.dataPos;
	this.initialVector = getInitialDist(this.initialWidth, this.initialHeight, this.initialDepth,this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

	// this.updateNode = function(phaseOffset, counter) {
	this.updateNode = function(phaseOff, counter) {

		this.initialVector = getInitialDist(this.initialWidth, this.initialHeight, this.initialDepth, this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

		var initVecX = this.initialVector[1].x ? this.initialVector[1].x : 0;
		var initVecY = this.initialVector[1].y ? this.initialVector[1].y : 0;
		var initVecZ = this.initialVector[1].z ? this.initialVector[1].z : 0;

		if (merged === false) {

			this.bhVector = getBHDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

			var bhX = (Math.abs(this.bhVector[1].x) < maxNodeVec) ? this.bhVector[1].x : (this.bhVector[1].x < 0) ? -maxNodeVec : maxNodeVec;
			var bhY = (this.bhVector[1].y < maxNodeVec) ? this.bhVector[1].y : (this.bhVector[1].y < 0) ? -maxNodeVec : maxNodeVec;
			var bhZ = (this.bhVector[1].z < maxNodeVec) ? this.bhVector[1].z : (this.bhVector[1].z < 0) ? -maxNodeVec : maxNodeVec;

			this.mesh.position.x += ((this.initialVector[0]+1)*initVecX*.1) + (1/(this.initialVector[0]+1) * bhX*100000);

			this.mesh.position.y += ((this.initialVector[0]+1)*initVecY*.1) + (1/(this.initialVector[0]+1) * bhY*100000);

			this.mesh.position.z += ((this.initialVector[0]+1)*initVecZ*.1) + (1/(this.initialVector[0]+1) * bhZ*100000);
		}
		else {
			if (data[phaseOff+counter]){
				this.mesh.position.x = this.initialWidth + this.initialWidth * friction * data[phaseOff+counter].y;
				this.mesh.position.y = this.initialHeight + this.initialHeight * friction * data[phaseOff+counter].y;
				this.mesh.position.z = this.initialDepth + this.initialDepth * friction * data[phaseOff+counter].y;
			}
			else {
				this.mesh.position.x += initVecX;
				this.mesh.position.y += initVecY;
				this.mesh.position.z += initVecZ;
			}
		}
	}

	this.reset = function() {
		counter = counterStart;
		this.mesh.position.x = this.initialWidth;
		this.mesh.position.y = this.initialHeight;
		this.mesh.position.z = this.initialDepth;
		this.distance = getDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
	}

	// this.distort = function(phaseOffset, counter) {
		this.distort = function() {

		// this.mesh.scale.y = this.initialScale * 1000/this.distance.y;
		// this.mesh.scale.x = this.initialScale * this.distance.x * nodeFactor;
		// this.mesh.scale.z = this.initialScale * this.distance.z * nodeFactor;

		if (polarization === "cross") {
			this.mesh.rotation.x = Math.PI / 4;
		}
		else {
			this.mesh.rotation.x = 0;
		}

	}

}
