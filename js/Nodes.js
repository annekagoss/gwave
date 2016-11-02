var counterStart = 1, polarization;
var nodeFactor = 5000;
var dataDampen = .0001;

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

			var maxMag = (Math.max(Math.abs(distanceA), Math.abs(distanceB)) === Math.abs(distanceA)) ? distanceA : distanceB;
		return [maxMag,newPos];
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
	this.r = 1;
	this.g = 1;
	this.b = 1;
	this.color = new THREE.Color( this.r, this.g, this.b );

	this.mat = new THREE.MeshPhongMaterial ({
		wireframe: true,
		color:this.color
	});

	var n = new THREE.Mesh(geom, this.mat);
	n.castShadow = true;
	n.receiveShadow = true;
	this.mesh.add(n);
	this.dataPos;
	this.initialVector = getInitialDist(this.initialWidth, this.initialHeight, this.initialDepth,this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
	this.bhVector = [0,0];

	// this.updateNode = function(phaseOffset, counter) {
	this.updateNode = function(phaseOff, counter) {

		this.initialVector = getInitialDist(this.initialWidth, this.initialHeight, this.initialDepth, this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

		var initVecX = this.initialVector[1].x ? this.initialVector[1].x : 0;
		var initVecY = this.initialVector[1].y ? this.initialVector[1].y : 0;
		var initVecZ = this.initialVector[1].z ? this.initialVector[1].z : 0;

		this.bhVector = getBHDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

		if (!merged && blackHolesCreated) {
			if (currentTransformation==="3d") {
				var maxNodeVec = 0.01;

				var bhX = (Math.abs(this.bhVector[1].x) < maxNodeVec) ? this.bhVector[1].x : (this.bhVector[1].x < 0) ? -maxNodeVec : maxNodeVec;
				var bhY = (this.bhVector[1].y < maxNodeVec) ? this.bhVector[1].y : (this.bhVector[1].y < 0) ? -maxNodeVec : maxNodeVec;
				var bhZ = (this.bhVector[1].z < maxNodeVec) ? this.bhVector[1].z : (this.bhVector[1].z < 0) ? -maxNodeVec : maxNodeVec;

				if (data[phaseOff+counter]){

					this.dataX = counter * dataDampen * this.initialWidth * data[phaseOff+counter].y;

					this.dataY = counter * dataDampen * this.initialHeight * data[phaseOff+counter].y;

					this.dataZ = counter * dataDampen * this.initialDepth * data[phaseOff+counter].y;

					this.mesh.position.x += ((this.initialVector[0]+1)*initVecX*.1) + (1/(this.initialVector[0]+1) * bhX*100000) + this.dataX;

					this.mesh.position.y += ((this.initialVector[0]+1)*initVecY*.1) + (1/(this.initialVector[0]+1) * bhY*100000) + this.dataY;

					this.mesh.position.z += ((this.initialVector[0]+1)*initVecZ*.1) + (1/(this.initialVector[0]+1) * bhZ*100000) + this.dataZ;
				}
				else {
					this.mesh.position.x += ((this.initialVector[0]+1)*initVecX*.1) + (1/(this.initialVector[0]+1) * bhX*100000);

					this.mesh.position.y += ((this.initialVector[0]+1)*initVecY*.1) + (1/(this.initialVector[0]+1) * bhY*100000);

					this.mesh.position.z += ((this.initialVector[0]+1)*initVecZ*.1) + (1/(this.initialVector[0]+1) * bhZ*100000);
				}
			}
			else {
				var maxNodeVec = 0.01;

				var bhX = (Math.abs(this.bhVector[1].x) < maxNodeVec) ? this.bhVector[1].x : (this.bhVector[1].x < 0) ? -maxNodeVec : maxNodeVec;
				var bhY = (this.bhVector[1].y < maxNodeVec) ? this.bhVector[1].y : (this.bhVector[1].y < 0) ? -maxNodeVec : maxNodeVec;
				var bhZ = (this.bhVector[1].z < maxNodeVec) ? this.bhVector[1].z : (this.bhVector[1].z < 0) ? -maxNodeVec : maxNodeVec;

				this.mesh.position.x += ((this.initialVector[0]+1)*initVecX*.1) + (100/(this.initialVector[0]+1) * bhX*10000);

				this.mesh.position.y -= ((this.initialVector[0]+1)*Math.abs(initVecY)*-.01) + (10/(this.initialVector[0]+1) * Math.abs(bhY)*10000);

				this.mesh.position.z += ((this.initialVector[0]+1)*initVecZ*.1) + (100/(this.initialVector[0]+1) * bhZ*10000);
			}

		}
		else {
			if (data[phaseOff+counter]){
				// this.mesh.position.x = this.initialWidth + this.initialWidth * friction * data[phaseOff+counter].y;
				// this.mesh.position.y = this.initialHeight + this.initialHeight * friction * data[phaseOff+counter].y;
				// this.mesh.position.z = this.initialDepth + this.initialDepth * friction * data[phaseOff+counter].y;

				this.dataX = counter * dataDampen * this.initialWidth * data[phaseOff+counter].y;

				this.dataY = counter * dataDampen * this.initialHeight * data[phaseOff+counter].y;

				this.dataZ = counter * dataDampen * this.initialDepth * data[phaseOff+counter].y;

				this.mesh.position.x += this.dataX;
				this.mesh.position.y += this.dataY;
				this.mesh.position.z += this.dataZ;
			}
			else {
				this.mesh.position.x += initVecX;
				this.mesh.position.y += initVecY;
				this.mesh.position.z += initVecZ;
			}
		}
		this.g = Math.min(Math.abs((this.bhVector[0]*.02)/this.initialVector[0])/1,1);
		this.b = Math.min(Math.abs((this.bhVector[0]*.05)/this.initialVector[0])/1, 1);
		this.r = 1- ( Math.min(Math.abs((this.bhVector[0]*.02)/this.initialVector[0])/1, 1));

		this.color.setRGB(this.r, this.g, this.b);
		this.mat.color = this.color;
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
