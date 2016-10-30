var counterStart = 1;
var factor = 0.0005;

var MeshVertex = function(vertex, parent, index) {

	this.initialX = vertex.x;
	this.initialY = vertex.y;
	this.initialZ = vertex.z;
	this.distance = getDist(vertex.x, vertex.y, vertex.z);
	this.parentCube = parent.children[0].geometry;
	this.parentVisibility = parent.visible;
	this.indexInParent = index;
	this.dataPos;

	if (currentTransformation === "2d") {
		this.initialY = flatAmp;
	}

	this.reset = function() {
		coutner = counterStart;
		this.parentCube.vertices[this.indexInParent].x = this.initialX;
		this.parentCube.vertices[this.indexInParent].y = this.initialY;
		this.parentCube.vertices[this.indexInParent].z = this.initialZ;
		this.distance = getDist(this.initialX,this.initialY,this.initialZ);
		this.parentCube.verticesNeedUpdate = true;
	}

	// this.updateMeshVertex = function(phaseOffset, counter) {
	// 	if (phaseOffset+counter >= data.length-counterStart) {
	// 		this.reset();
	// 		return;
	// 	}
	this.updateMeshVertex = function(){

		if (currentTransformation === "2d") {
			this.parentCube.vertices[this.indexInParent].y = this.initialY + this.initialY * factor * friction * this.distance;
		}
		else {
			this.parentCube.vertices[this.indexInParent].x = this.initialX + this.initialX * factor * this.distance;
			this.parentCube.vertices[this.indexInParent].y = this.initialY + this.initialY * factor * this.distance;
			this.parentCube.vertices[this.indexInParent].z = this.initialZ + this.initialZ * factor * this.distance;
		}
		// this.dataPos = phaseOffset + counter;


		this.distance = getDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);
		this.parentCube.verticesNeedUpdate = true;
	}
}
