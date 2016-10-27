var counterStart = 1, polarization;

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

	this.updateNode = function(phaseOffset, counter) {
		if (phaseOffset+counter >= data.length-counterStart) {
			this.reset();
			return;
		}

		this.dataPos = phaseOffset+counter;
		this.mesh.position.y = this.initialHeight + this.initialHeight * friction * data[phaseOffset+counter].y;

		if (currentTransformation === "3d") {
			this.mesh.position.x = this.initialWidth + this.initialWidth * friction * data[phaseOffset+counter].y;
			this.mesh.position.z = this.initialDepth + this.initialDepth * friction * data[phaseOffset+counter].y;
		}

		this.distance = getDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
	}

	this.reset = function() {
		counter = counterStart;
		this.mesh.position.x = this.initialWidth;
		this.mesh.position.y = this.initialHeight;
		this.mesh.position.z = this.initialDepth;
		this.distance = getDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
	}

	this.distort = function(phaseOffset, counter) {
		if (phaseOffset+counter >= data.length-counterStart) {
			return;
		}
		this.mesh.scale.y = this.initialScale + (this.initialScale * data[phaseOffset+counter].y) + 10/this.distance;
		this.mesh.scale.x = this.initialScale + (this.initialScale * -1 * data[phaseOffset+counter].y) + 10/this.distance;
		this.mesh.scale.z = this.initialScale + (this.initialScale * -1 * data[phaseOffset+counter].y) + 10/this.distance;
		if (polarization === "cross") {
			this.mesh.rotation.x = Math.PI / 4;
		}
		else {
			this.mesh.rotation.x = 0;
		}

	}

}
