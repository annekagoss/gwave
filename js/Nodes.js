var Node = function(name) {
	this.mesh = new THREE.Object3D();

	this.mesh.name = name;
	this.name = name;

	var geom = new THREE.SphereGeometry(nodeParticleSize,nodeRes,nodeRes);
	this.r = 1;
	this.g = 1;
	this.b = 1;
	this.color = new THREE.Color( this.r, this.g, this.b );

	this.mat = new THREE.MeshPhongMaterial ({
		wireframe: true,
		color:this.color
	});
	n = new THREE.Mesh(geom, this.mat);
	this.mesh.add(n);
	this.dataPos;
	this.initialVector = getInitialDist(this.initialX, this.initialY, this.initialZ,this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
	this.bhVector = [0,0];

	this.updateNode = function(phaseOff, counter) {
		this.initialVector = getInitialDist(this.initialX, this.initialY, this.initialZ, this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

		this.initVecX = this.initialVector[1].x ? this.initialVector[1].x : 0;
		this.initVecY = this.initialVector[1].y ? this.initialVector[1].y : 0;
		this.initVecZ = this.initialVector[1].z ? this.initialVector[1].z : 0;

		this.bhVector = getBHDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

		this.bhX = this.bhVector[1].x;
		this.bhY = this.bhVector[1].y;
		this.bhZ = this.bhVector[1].z;

		dataDampen = (currentTransformation==="3d") ? 1 : 1;
		planeFactor = (currentTransformation==="3d") ? 1 : 1;

		this.dataMovement = (data[counter-phaseOff]) ? (dataDampen * data[counter-phaseOff].waveVal) : 0;

		if (blackHolesCreated) {
			this.mesh.position.x += ((this.initialVector[0]+1)*this.initVecX*.1) + (1/(this.bhVector[0]+1) * this.bhX*nodeGravityStrength*massForGravity) * this.dataMovement;

			this.mesh.position.y += ((this.initialVector[0]+1)*this.initVecY*.1) + (1/(this.bhVector[0]+1) * this.bhY*nodeGravityStrength*massForGravity) * this.dataMovement;

			this.mesh.position.z += ((this.initialVector[0]+1)*this.initVecZ*.1) + (1/(this.bhVector[0]+1) * this.bhZ*nodeGravityStrength*massForGravity) * this.dataMovement;
		}
		
		this.g = Math.min(Math.abs(this.bhVector[0]*.0005),1);
		this.b = Math.min(Math.abs(this.bhVector[0]*.00075),1);
		this.r = 1-(Math.min(Math.abs(this.bhVector[0]*.0002),1));

		this.color.setRGB(this.r, this.g, this.b);
		this.mat.color = this.color;

		if (this.dataMovement < 0) {
			this.mesh.scale.y = nodeParticleSize * 1/(Math.abs(this.dataMovement*(1/(this.bhVector[0]+1))*distortionFactor*planeFactor)+1);
			this.mesh.scale.x = nodeParticleSize * (Math.abs(this.dataMovement*(1/(this.bhVector[0]+1))*distortionFactor*planeFactor)+1);
			this.mesh.scale.z = nodeParticleSize * (Math.abs(this.dataMovement*(1/(this.bhVector[0]+1))*distortionFactor*planeFactor)+1);
		}
		else {
			this.mesh.scale.x = nodeParticleSize * 1/(Math.abs(this.dataMovement*(1/(this.bhVector[0]+1))*distortionFactor*planeFactor)+1);
			this.mesh.scale.z = nodeParticleSize * 1/(Math.abs(this.dataMovement*(1/(this.bhVector[0]+1))*distortionFactor*planeFactor)+1);

			this.mesh.scale.y = nodeParticleSize * (Math.abs(this.dataMovement*(1/(this.bhVector[0]+1))*distortionFactor*planeFactor)+1);
		}

		if (polarization === "cross") {
			this.mesh.rotation.x = Math.PI / 4;
		}
		else {
			this.mesh.rotation.x = 0;
		}
	}
}
