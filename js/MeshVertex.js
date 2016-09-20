var MeshVertex = function(vertex, parent, index) {
	this.initialX = vertex.x;
	this.initialY = vertex.y;
	this.initialZ = vertex.z;
	this.distance = getDist(vertex.x, vertex.y, vertex.z);
	this.parentCube = parent.children[0].geometry;
	this.parentVisibility = parent.visible;
	this.indexInParent = index;
	this.dataPos;

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
		// console.log(currentDataset.length);
		if (phaseOffset+counter >= currentDataset.length-counterStart) {
			console.log('reset spacetime');
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
		if (phaseOffset + counter >= data.length - counterStart) {
			console.log('reset vertex');
			this.reset();
			return;
		}
		// else {
			if (currentTransformation === "3d") {
				if (this.indexInParent === 0) {
					// console.log(phaseOffset+counter);
					// console.log('phaseOffset: ' + phaseOffset);
					// console.log('counter: ' + phaseOffset);
					// console.log(currentDataset[phaseOffset + counter]);
					// console.log(currentDataset.length);
				}
				this.parentCube.vertices[this.indexInParent].x = this.initialX + this.initialX * friction * currentDataset[phaseOffset + counter].y;
				this.parentCube.vertices[this.indexInParent].z = this.initialZ + this.initialZ * friction * currentDataset[phaseOffset + counter].y;
			}
			this.dataPos = phaseOffset + counter;
			this.parentCube.vertices[this.indexInParent].y = this.initialY + this.initialY * friction * currentDataset[phaseOffset + counter].y;

			this.distance = getDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);
			this.parentCube.verticesNeedUpdate = true;
		// }
	}
}
