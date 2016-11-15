var MeshVertex = function(vertex, parent, index) {
	this.initialX = vertex.x;
	this.initialY = (currentTransformation === "3d") ? vertex.y : flatAmp;
	this.initialZ = vertex.z;
	this.parentCube = parent.children[0].geometry;
	this.indexInParent = index;
	this.bhVector = [0,0];

	dataDampen = (currentTransformation==="3d") ? 20 : 10;
	planeFactor = (currentTransformation==="3d") ? 1 : 1;

	this.updateMeshVertex = function(phaseOff, counter){

		this.initialVector = getInitialDist(this.initialX, this.initialY, this.initialZ, this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);

		this.bhVector = getBHDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);

		this.initVecX = this.initialVector[1].x ? this.initialVector[1].x : 0;
		this.initVecY = this.initialVector[1].y ? this.initialVector[1].y : 0;
		this.initVecZ = this.initialVector[1].z ? this.initialVector[1].z : 0;

		this.dataMovement = (data[counter-phaseOff]) ? (dataDampen * data[counter-phaseOff].waveVal) : 0;

		this.bhX = (Math.abs(this.bhVector[1].x) < maxMeshVec) ? this.bhVector[1].x : (this.bhVector[1].x < 0) ? -maxMeshVec : maxMeshVec;
		this.bhY = (Math.abs(this.bhVector[1].y) < maxMeshVec) ? this.bhVector[1].y : (this.bhVector[1].y < 0) ? -maxMeshVec : maxMeshVec;
		this.bhZ = (Math.abs(this.bhVector[1].z) < maxMeshVec) ? this.bhVector[1].z : (this.bhVector[1].z < 0) ? -maxMeshVec : maxMeshVec;

		if (blackHolesCreated) {
			this.parentCube.vertices[this.indexInParent].x += ((this.initialVector[0]+1)*this.initVecX*.1) + (1/(this.bhVector[0]+1) * this.bhX *meshGravityStrength*massForGravity) * this.dataMovement;

			this.parentCube.vertices[this.indexInParent].y += ((this.initialVector[0]+1)*this.initVecY*.1*(1/planeFactor)) + (1/(this.bhVector[0]+1) * this.bhY *meshGravityStrength*massForGravity) * this.dataMovement;

			this.parentCube.vertices[this.indexInParent].z += ((this.initialVector[0]+1)*this.initVecZ*.1) + (1/(this.bhVector[0]+1) * this.bhZ*meshGravityStrength*massForGravity) * this.dataMovement;
		}
		this.parentCube.verticesNeedUpdate = true;
	}
}
