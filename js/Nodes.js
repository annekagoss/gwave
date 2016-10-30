var counterStart = 1, polarization;
var factor = 100;

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

	// this.updateNode = function(phaseOffset, counter) {
	this.updateNode = function() {
		this.distance = getDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

		if (currentTransformation === "2d") {
			this.mesh.position.y = this.initialHeight + (factor * this.distance.y * friction * .25);
			this.mesh.position.x = this.initialWidth + (factor * this.distance.x * friction  * .25);
			this.mesh.position.z = this.initialDepth + (factor * this.distance.z * friction  * .25);
		}
		else {

			this.mesh.position.y = this.initialHeight + (factor * this.distance.y * friction);
			this.mesh.position.x = this.initialWidth + (factor * this.distance.x * friction);
			this.mesh.position.z = this.initialDepth + (factor * this.distance.z * friction);


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
		// this.mesh.scale.x = this.initialScale * this.distance.x * factor;
		// this.mesh.scale.z = this.initialScale * this.distance.z * factor;

		if (polarization === "cross") {
			this.mesh.rotation.x = Math.PI / 4;
		}
		else {
			this.mesh.rotation.x = 0;
		}

	}

}
