var Node = function() {
	this.mesh = new THREE.Object3D();
	var geom = new THREE.SphereGeometry(nodeSize,nodeRes,nodeRes);
	var mat = new THREE.MeshPhongMaterial ({
		wireframe: true,
		color:Colors.white
	});

	var n = new THREE.Mesh(geom, mat);
	n.castShadow = true;
	n.receiveShadow = true;
	this.mesh.add(n);

	this.updateNode = function(phaseOffset, counter) {
		if (phaseOffset+counter >= data.length-counterStart) {
			this.reset();
			return;
		}
		this.mesh.position.y = this.initialHeight + this.initialHeight * friction * data[phaseOffset+counter].y;
		this.mesh.position.x = this.initialWidth + this.initialWidth * friction * data[phaseOffset+counter].y;
		this.mesh.position.z = this.initialDepth + this.initialDepth * friction * data[phaseOffset+counter].y;
		this.distance = getDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
	}

	this.flatten = function(scale) {
		var newScale;
		if (this.initialHeight !== 0) {
			newScale = scale;
		}
		else {
			newScale = scale - 0.25;
		}
		this.mesh.position.y = 0;
		this.expandedY = this.initialHeight;
		this.initialHeight = this.mesh.position.y;

		this.mesh.position.x = this.initialWidth*newScale;
		this.expandedX = this.initialWidth;
		this.initialWidth = this.mesh.position.x;

		this.mesh.position.z = this.initialDepth*newScale;
		this.expandedZ = this.initialDepth;


		this.distance = getDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
	}

	this.reset = function() {
		counter = counterStart;
		this.mesh.position.x = this.initialWidth;
		this.mesh.position.y = this.initialHeight;
		this.mesh.position.z = this.initialDepth;
		this.distance = getDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
	}

	this.checkForReset = function(phaseOffset, counter) {
		if (phaseOffset+counter >= data.length-counterStart) {
			resetSpaceTime();
		}
	}
}
