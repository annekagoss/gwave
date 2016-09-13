var MeshVertex = function(vertex, parent, index) {
	this.initialX = vertex.x;
	this.initialY = vertex.y;
	this.initialZ = vertex.z;
	this.distance = getDist(vertex.x, vertex.y, vertex.z);
	this.parentCube = parent.children[0].geometry;
	this.parentVisibility = parent.visible;
	this.indexInParent = index;
	this.dataPos;
	// this.finishedLerp = false;

	// Get new position from dataset to use for lerp movement
	// this.updatePositionData = function(phaseOffset) {
	// 	this.finishedLerp = false;
	// 	if (phaseOffset + this.counter >= data.length - counterStart) {
	// 		this.reset();
	// 	} else {
	// 		this.previousPositionX = this.parentCube.vertices[this.indexInParent].x;
	// 		this.previousPositionY = this.parentCube.vertices[this.indexInParent].y;
	// 		this.previousPositionZ = this.parentCube.vertices[this.indexInParent].z;
	// 	}
	//
	// 	this.newPositionX = this.initialX + (this.initialX * friction * data[phaseOffset + this.counter].y);
	// 	this.newPositionY = this.initialY + (this.initialY * friction * data[phaseOffset + this.counter].y);
	// 	this.newPositionZ = this.initialZ + (this.initialZ * friction * data[phaseOffset + this.counter].y);
	//
	// 	this.distance = getDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);
	// 	this.counter++;
	// }
	//
	// this.moveWithLerp = function() {
	// 	this.parentCube.vertices[this.indexInParent].x = lerpPosition(this.parentCube.vertices[this.indexInParent].x, this.newPositionX, lerpDuration, frame);
	// 	this.parentCube.vertices[this.indexInParent].y = lerpPosition(this.parentCube.vertices[this.indexInParent].y, this.newPositionY, lerpDuration, frame);
	// 	this.parentCube.vertices[this.indexInParent].z = lerpPosition(this.parentCube.vertices[this.indexInParent].z, this.newPositionZ, lerpDuration, frame);
	// 	this.parentCube.verticesNeedUpdate = true;
	// }

	this.reset = function() {
		counter = counterStart;
		this.previousPositionX = this.initialX;
		this.previousPositionY = this.initialY;
		this.previousPositionZ = this.initialZ;

		this.parentCube.vertices[this.indexInParent].x = this.initialX;
		this.parentCube.vertices[this.indexInParent].y = this.initialY;
		this.parentCube.vertices[this.indexInParent].z = this.initialZ;
		this.distance = getDist(this.initialX,this.initialY,this.initialZ);
		this.parentCube.verticesNeedUpdate = true;
	}

	this.checkForReset = function(phaseOffset, counter) {
		if (phaseOffset+counter >= data.length-counterStart) {
			resetSpaceTime();
		}
	}

	this.flatten = function() {
		this.parentCube.vertices[this.indexInParent].y = flatAmp;
		this.previousPositionY = flatAmp;
		this.expandedY = this.initialY;
		this.initialY = flatAmp;
		this.distance = getDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);
		this.parentCube.verticesNeedUpdate = true;
	}

	this.expand = function() {
		this.parentCube.vertices[this.indexInParent].y = this.expandedY;
		this.previousPositionY = this.expandedY;
		this.initialY = this.expandedY;
		this.distance = getDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);
		this.parentCube.verticesNeedUpdate = true;
	}

	// Movement without lerp
	this.updateMeshVertex = function(phaseOffset, counter) {
		if (phaseOffset + this.counter >= data.length - counterStart) {
			this.reset();
		}
		if (currentTransformation === "3d") {
			this.parentCube.vertices[this.indexInParent].x = this.initialX + this.initialX * friction * data[phaseOffset + counter].y;
			this.parentCube.vertices[this.indexInParent].z = this.initialZ + this.initialZ * friction * data[phaseOffset + counter].y;
		}
		this.dataPos = phaseOffset + counter;
		this.parentCube.vertices[this.indexInParent].y = this.initialY + this.initialY * friction * data[phaseOffset + counter].y;

		this.distance = getDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);
		this.parentCube.verticesNeedUpdate = true;
	}
}
