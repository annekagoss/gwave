var counterStart = 1;
var meshFactor = 1000;

var MeshVertex = function(vertex, parent, index) {

	this.initialX = vertex.x;
	this.initialY = vertex.y;
	this.initialZ = vertex.z;
	// this.distance = getDist(vertex.x, vertex.y, vertex.z);
	this.parentCube = parent.children[0].geometry;
	this.parentVisibility = parent.visible;
	this.indexInParent = index;
	this.dataPos;

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
	this.updateMeshVertex = function(){

		this.initialVector = getInitialDist(this.initialX, this.initialY, this.initialZ, this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z)

		if (merged === false) {

			this.bhVector = getBHDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);

			this.parentCube.vertices[this.indexInParent].x += this.bhVector.x * meshFactor;
			this.parentCube.vertices[this.indexInParent].y += this.bhVector.y * meshFactor;
			this.parentCube.vertices[this.indexInParent].z += this.bhVector.z * meshFactor;

		}

			if (this.initialVector[0] > 20) {
				this.parentCube.vertices[this.indexInParent].y += this.initialVector[1].y * this.initialVector[0] * .1;
				this.parentCube.vertices[this.indexInParent].x += this.initialVector[1].x * this.initialVector[0] * .1;
				this.parentCube.vertices[this.indexInParent].z += this.initialVector[1].z * this.initialVector[0] * .1;
			}

			this.parentCube.verticesNeedUpdate = true;
		}
	
}
