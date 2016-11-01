var counterStart = 1;
var meshFactor = 1000;
var maxVec = .025;

var MeshVertex = function(vertex, parent, index) {

	this.initialX = vertex.x;
	this.initialY = vertex.y;
	this.initialZ = vertex.z;
	// this.distance = getDist(vertex.x, vertex.y, vertex.z);
	this.parentCube = parent.children[0].geometry;
	this.parentVisibility = parent.visible;
	this.indexInParent = index;
	this.dataPos;
	this.vx = 0;
	this.vy = 0;
	this.vz = 0;
	this.ax = 0;
	this.ay = 0;
	this.az = 0;

	if (currentTransformation === "2d") {
		this.initialY = flatAmp;
	}

	this.reset = function() {
		// counter = counterStart;
		this.parentCube.vertices[this.indexInParent].x = this.initialX;
		this.parentCube.vertices[this.indexInParent].y = this.initialY;
		this.parentCube.vertices[this.indexInParent].z = this.initialZ;
		this.bhVector = getBHDist(this.initialX, this.initialY, this.initialZ);
		this.parentCube.verticesNeedUpdate = true;
		// this.distance = getDist(this.initialX,this.initialY,this.initialZ);

	}

	// this.updateMeshVertex = function(phaseOffset, counter) {
	// 	if (phaseOffset+counter >= data.length-counterStart) {
	// 		this.reset();
	// 		return;
	// 	}
	this.updateMeshVertex = function(phaseOff, counter){

		this.initialVector = getInitialDist(this.initialX, this.initialY, this.initialZ, this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);

		this.overshootVector = getInitialDist(this.initialX*2, this.initialY*2, this.initialZ*2, this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);

		var initVecX = this.initialVector[1].x ? this.initialVector[1].x : 0;
		var initVecY = this.initialVector[1].y ? this.initialVector[1].y : 0;
		var initVecZ = this.initialVector[1].z ? this.initialVector[1].z : 0;

		var overVecX = this.overshootVector[1].x ? this.overshootVector[1].x : 0;
		var overVecY = this.overshootVector[1].y ? this.overshootVector[1].y : 0;
		var overVecZ = this.overshootVector[1].z ? this.overshootVector[1].z : 0;

		if (merged === false) {
			this.bhVector = getBHDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);

			var bhX = (Math.abs(this.bhVector[1].x) < maxVec) ? this.bhVector[1].x : (this.bhVector[1].x < 0) ? -maxVec : maxVec;
			var bhY = (this.bhVector[1].y < maxVec) ? this.bhVector[1].y : (this.bhVector[1].y < 0) ? -maxVec : maxVec;
			var bhZ = (this.bhVector[1].z < maxVec) ? this.bhVector[1].z : (this.bhVector[1].z < 0) ? -maxVec : maxVec;

			this.parentCube.vertices[this.indexInParent].x += ((this.initialVector[0]+1)*initVecX*.1) + (1/(this.initialVector[0]+1) * bhX * (25000-currentSeparation)) +  ((this.initialVector[0]+1) * overVecX * .075);

			this.parentCube.vertices[this.indexInParent].y += ((this.initialVector[0]+1)*initVecY*.1) + (1/(this.initialVector[0]+1) * bhY * (25000-currentSeparation))  +  ((this.initialVector[0]+1) * overVecY * .075);

			this.parentCube.vertices[this.indexInParent].z += ((this.initialVector[0]+1)*initVecZ*.1) + (1/(this.initialVector[0]+1) * bhZ * (25000-currentSeparation))  +  ((this.initialVector[0]+1) * overVecZ * .075);
		}
		else {
			if (data[phaseOff + counter]) {
				this.parentCube.vertices[this.indexInParent].x = this.initialX + this.initialX * friction * data[phaseOff + counter].y;
				this.parentCube.vertices[this.indexInParent].y = this.initialY + this.initialY * friction * data[phaseOff + counter].y;
				this.parentCube.vertices[this.indexInParent].z = this.initialZ + this.initialZ * friction * data[phaseOff + counter].y;
			}
			else {
				this.parentCube.vertices[this.indexInParent].x += initVecX;
				this.parentCube.vertices[this.indexInParent].y += initVecY;
				this.parentCube.vertices[this.indexInParent].z += initVecZ;
			}
		}
		this.parentCube.verticesNeedUpdate = true;
	}

}
