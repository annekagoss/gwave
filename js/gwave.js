// GLOBAL
var greenOffset = new THREE.Color(1, .5, 1);
var blue = new THREE.Color(0x0000FF);
var green = new THREE.Color(0x2ECC71);
// Scene variables
var Colors = {
	black: 0x000000,
	white: 0xFFFFFF,
	blue: blue,
	green: green,
	greenOffset: greenOffset
};
var container, controls, camera, fieldOfView, aspectRatio, nearPlane, farPlane, hemisphereLight, mesh, geometry, HEIGHT, WIDTH;

// Data
var dataRendered = false;
var dataSetH1, dataSetTemplate, data;

// Animation
var running = true;
var counter = counterStart;
var phaseOff;

// Controls
var currentRenderStyle = "nodes";
var currentDataset;

// Space array rendering
var nodeArray = [], nodeParent;

var cubeArray = [],
		cubeVertices = [],
		meshVertices = [];

// Optimal settings for 16384hz resolution datasets
var friction = .25,
		cubeSize = 1200,
		cubeRes = 0.02,
		cubeSpread = 200, // distance between cube layers
		cubeSpeed = speed - 1,
		planeScale = 1,
		meshPlaneScale = 3,
		nodeSize = 1000;
		nodeSpread = 175,
		nodeParticleSize = 2,
		nodePlaneScale = 4,
		nodeRes = 1,
		nodeFalloff = 2, // Wiggliness.  Higher than 2 will make points erratic during peak.
		meshCubeFalloff = 6/cubeSpread,
		meshPlaneFalloff = 200/(cubeSize*meshPlaneScale),
		maxMeshCubeDistance = getBHDist(cubeSize, cubeSize, cubeSize)[0],
		maxMeshPlaneDistance = getBHDist(cubeSize*meshPlaneScale, 1, cubeSize*meshPlaneScale)[0],
		nodeWidth = nodeSize/nodeSpread*2, // Rendering will be slow without the *0.1
		nodeHeight = nodeSize/nodeSpread*2,
		nodeDepth = nodeSize/nodeSpread*2,
		maxNodeCubeDistance = getBHDist(nodeWidth*2*nodeSpread, nodeHeight*.5*nodeSpread, nodeDepth*2*nodeSpread)[0];
		maxNodePlaneDistance = getBHDist(nodeWidth*2*nodeSpread, flatAmp, nodeDepth*2*nodeSpread)[0];

		speed = 2;


function updateMaxDistances() {
	maxMeshDistance = (currentTransformation === "3d") ? maxMeshCubeDistance : meshPlaneFalloff;

	meshFalloff = (currentTransformation === "3d") ? meshCubeFalloff : meshPlaneFalloff;

	maxNodeDistance = (currentTransformation === "3d") ? maxNodeCubeDistance : maxNodePlaneDistance;
}

updateMaxDistances();


var planeCameraPos = { x: 1110.51380089235, y: 26.691407694486042, z: 863.5923035685921 },
	cubeCameraPos = { x: 920, y: 692, z: 809 };

function createScene() {
	// DOM setup
	var container = document.createElement('div');
	jQuery('body').prepend(container);
	container.className = 'container';

	// Camera setup

	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;

	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
	);

	camera.position.x = cubeCameraPos.x;
	camera.position.y = cubeCameraPos.y;
	camera.position.z = cubeCameraPos.z;
	camera.rotation = (-0.7076907934882674, 0.7128062225857894, 0.4640637998884659);

	controls = new THREE.TrackballControls(camera);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [65, 83, 68];
	controls.addEventListener('change', render);

	// Scene setup
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(Colors.black, 0, 4500);

	// Renderer setup
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(WIDTH, HEIGHT);
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);



	jQuery('.transform').on('click', function(){
		destroyBlackHoles();
		running = false;
		jQuery('.transform').toggleClass('selected');
		transformSpaceTime(jQuery(this));
		setTimeout(function(){
			adjustFriction();
			updateMaxDistances();
			running = true;
			render();
			createBlackHoles();
			loop();
		},0);
	});
	jQuery('.pause').on('click', function(){
		running = !running;
		if (running) {
			loop();
		}
		jQuery(this).toggleClass('playing');
	});

	jQuery('.reset').on('click', function(){
		resetSpaceTime();
	});

	jQuery('.render-style').on('click', function(){
		destroyBlackHoles();
		var newStyle = jQuery(this).attr('value');
		jQuery('.render-style').toggleClass('selected');
		if (currentRenderStyle !== newStyle) {
			running = false;
			destroySpaceTime();
			currentRenderStyle = jQuery(this).attr('value');
			switchLighting(currentRenderStyle);
			createSpaceTime();
			createBlackHoles();

			// if (jQuery('.transform.selected').attr('value') !== '3d') {
			// 	setTimeout(function(){
			// 		transformSpaceTime(jQuery('.transform.selected'));
			// 	},0);
			// }
			setTimeout(function(){
				running = true;
				render();
				loop();
			},100);
		}
	});

	jQuery('.slider').on('mousedown', function() {
		controls.enabled = false;
	});

	jQuery('.speed-val').text(speed);
	jQuery('.slider').val(speed);
	jQuery('.slider').on('mouseup', function(e) {
		running = false;
		destroyBlackHoles();
		resetSpaceTime();
		speed = e.target.valueAsNumber;
		jQuery('.speed-val').text(speed);
		controls.enabled = true;
		createBlackHoles();
		setTimeout(function() {
			running = true;
			render();
			loop();
		},0);
	});

	// jQuery('.data-picker .button').on('click', function(){
	// 	destroyBlackHoles();
	// 	currentDashboard = jQuery(this).attr('value') === "template" ? dashboardTemplate : dashboardH1;
	// 	adjustFriction();
	// 	jQuery('.graph-container').toggleClass('shown');
	// 	jQuery('.data-picker .button').toggleClass('selected');
	// 	retrieveDataset(jQuery(this).attr('value'));
	// 	resetSpaceTime();
	// });

	jQuery('.polarization.button').on('click', function(){
		jQuery('.polarization.button').toggleClass('selected');
		polarization = jQuery(this).attr('value');
	});
}

function adjustFriction() {
	if (currentDashboard === dashboardTemplate) {
		if (currentTransformation === "3d") {
			friction = 0.05;
		}
		else {
			friction = .05;
		}
	}
	else {
		if (currentTransformation === "3d") {
			friction = 0.25;
		}
		else {
			if (currentRenderStyle === "mesh") {
				friction = 20;
			}
			else {
				friction = 6;
			}
		}
	}
}

function createLights() {
	// hemisphereLight = new THREE.HemisphereLight(Colors.blue, Colors.green, 1);
	hemisphereLight = new THREE.HemisphereLight(Colors.greenOffset, Colors.greenOffset, 1);
	hemisphereLight.position.set(0, 0, 0);
	scene.add(hemisphereLight);
}

function switchLighting(style) {
	hemisphereLight.color = (style === "mesh") ? Colors.blue : Colors.greenOffset;
	hemisphereLight.groundColor = (style === "mesh") ? Colors.green : Colors.greenOffset;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.handleResize();
}


function loop() {
	camera.lookAt(scene.position);
	controls.update();

	if (dataRendered) {
		if (currentRenderStyle === "mesh") {
			meshVertices.forEach(function(v) {
				phaseOff = Math.round((maxMeshDistance - v.bhVector[0]+1) * meshFalloff);
				v.updateMeshVertex(phaseOff, counter);
			});
		}
		else {
			nodeArray.forEach(function(n) {
				phaseOff = Math.round((maxNodeDistance -n.bhVector[0]+1)*nodeFalloff/nodeSpread);
				n.updateNode(phaseOff, counter);
			});
			// console.log(nodeArray[100].dataMovement);
		}
		// console.log(currentDashboard);
		// if (currentDashboard) {
			dashboardCombined.updatePosition(counter);
		// }

		if (binary) {
			binary.update(counter);
		}
	}

	render();

	setTimeout(function(){
		counter += speed;
		if (data) {
			counter = counter >= data.length ? counterStart : counter;
		}
		if (running) {	requestAnimationFrame(loop);}
	},0);
}

function getInitialDist(initX, initY, initZ, x, y, z) {
		var initialVector = new THREE.Vector3(initX, initY, initZ);
		var currentVector = new THREE.Vector3(x,y,z);

		var distance = currentVector.distanceTo(initialVector);

		var subvec = new THREE.Vector3();
	  subvec = subvec.subVectors(initialVector,currentVector);

		var newPos = {
			x: subvec.x/distance,
			y: subvec.y/distance,
			z: subvec.z/distance
		}

		return [distance,newPos];
}



function lerpPosition(posA, posB, duration, f) {
	var t = f / duration;
	var newPos = posA + t * (posB - posA);
	return newPos;
}

function render() {
	renderer.render(scene, camera);
	if (mirrorA && mirrorB) {
		mirrorA.renderWithMirror(mirrorB);
		mirrorB.renderWithMirror(mirrorA);
	}
}

function createNode(xVal, yVal, zVal, spread) {
	this.mesh = new THREE.Object3D();
	var node = new Node();
	node.mesh.position.x = xVal*spread;
	node.mesh.position.y = (currentTransformation === "3d") ? yVal*spread : flatAmp;
	node.mesh.position.z = zVal*spread;
	node.mesh.scale.x = nodeParticleSize;
	node.mesh.scale.y = nodeParticleSize;
	node.mesh.scale.z = nodeParticleSize;
	node.initialScale = nodeParticleSize;
	node.initialX = node.mesh.position.x;
	node.initialY = node.mesh.position.y;
	node.initialZ = node.mesh.position.z;
	// node.distance = getBHDist(node.initialX, node.initialY, node.initialZ);

	this.mesh.add(node.mesh);
	this.node = node;
	scene.add(node.mesh);
	nodeArray.push(this.node);
}

function createNodeArray() {
	for (i=nodeWidth*-0.5; i<nodeWidth*0.5; i++) {
		for (j=nodeHeight*-0.5; j<nodeHeight*0.5; j++) {
			for (k=nodeDepth*-0.5; k<nodeDepth*0.5; k++) {
				createNode(i, j, k, nodeSpread);
			}
		}
	}
}

function createNodePlane() {
	for (i=nodeWidth*-0.5*nodePlaneScale; i<nodeWidth*0.5*nodePlaneScale; i++) {
			for (k=nodeDepth*-0.5*nodePlaneScale; k<nodeDepth*0.5*nodePlaneScale; k++) {
				createNode(i, 1, k, nodeSpread*0.5);
			}
	}
	maxNodeDistance = getBHDist(nodeWidth*1*nodeSpread, nodeHeight*.5*nodeSpread, nodeDepth*1*nodeSpread);
}

function createPlaneMesh() {
	createPlane(cubeSize*meshPlaneScale, cubeRes*.5);
	setTimeout(function() {
		var cube = cubeArray[0];
		var vertices = cube.children[0].geometry.vertices;
		vertices.forEach(function(v) {
			var meshVertex = new MeshVertex(v, cube, vertices.indexOf(v));
			meshVertices.push(meshVertex);
		})
	}, 0);
}

function createPlane(size, res) {
	this.mesh = new THREE.Object3D();
	var geom = new THREE.CubeGeometry(size, 1, size, size*res, size*res, size*res);
	var mat = new THREE.MeshPhongMaterial({
		wireframe: true,
		color: Colors.white
	});
	var n = new THREE.Mesh(geom, mat);
	this.mesh.position.y = flatAmp;
	this.mesh.add(n);
	this.mesh.name = "cube plane " + size;
	scene.add(this.mesh);
	cubeArray.push(this.mesh);
}

function createCubeMesh() {
	for (i = 0; i < cubeSize; i += cubeSpread) {
		var resolution = i < cubeRes ? i : cubeRes;
		createCube(i, resolution);
	}
	setTimeout(function() {
		cubeArray.forEach(function(cube) {
			var vertices = cube.children[0].geometry.vertices;
			vertices.forEach(function(v) {
				var meshVertex = new MeshVertex(v, cube, vertices.indexOf(v));
				meshVertices.push(meshVertex);
			})
		});
	}, 0);
}

function createCube(size, res) {
	this.mesh = new THREE.Object3D();
	var geom = new THREE.CubeGeometry(size, size, size, size*res, size*res, size*res);
	var mat = new THREE.MeshPhongMaterial({
		wireframe: true,
		color: Colors.white
	});

	var n = new THREE.Mesh(geom, mat);
	this.mesh.add(n);
	this.mesh.name = "cube mesh " + size;
	scene.add(this.mesh);
	cubeArray.push(this.mesh);
}

function resetSpaceTime() {
	running = false;
	destroySpaceTime();
	setTimeout(function(){
		createSpaceTime();
	},10);
	setTimeout(function(){
		counter = counterStart;
		running = true;
		loop();
	},20);
}

function destroySpaceTime() {
	if (currentRenderStyle === "mesh") {
		cubeArray.forEach(function(cube) {
			scene.remove(cube);
		});
		cubeArray = [];
		meshVertices = [];
	}
	else if (currentRenderStyle === "nodes") {
		nodeArray.forEach(function(node) {
			scene.remove(node.mesh);
		});
		nodeArray = [];
	}
	currentDashboard.updatePosition(counter);
	console.log('spacetime destroyed');
}

function createSpaceTime() {
	if (currentRenderStyle === "mesh") {
		if (currentTransformation === "3d") {
			createCubeMesh();
		}
		else {
			createPlaneMesh();
		}
	}
	else if (currentRenderStyle === "nodes") {
		if (currentTransformation === "3d") {
			createNodeArray();
		}
		else {
			createNodePlane();
		}
	}
	console.log('spacetime created');
}

function flattenSpaceTime(){
	if (currentRenderStyle === "mesh") {
		destroySpaceTime();
		cubeArray = [];
		setTimeout( function() {
			createPlaneMesh();
		},10);
	}
	else if (currentRenderStyle === "nodes") {
		destroySpaceTime();
		nodeArray = [];
		createNodePlane();
	}
	camera.position.x = planeCameraPos.x;
	camera.position.y = planeCameraPos.y;
	camera.position.z = planeCameraPos.z;
}

function expandSpaceTime(){
	if (currentRenderStyle === "mesh") {
		destroySpaceTime();
		cubeArray = [];
		createCubeMesh();
	}
	else if (currentRenderStyle === "nodes") {
		destroySpaceTime();
		nodeArray = [];
		createNodeArray();
	}
}

function transformSpaceTime(e) {
	var value = jQuery(e).attr('value');
	if (value === "2d") {
		flattenSpaceTime();
	}
	else if (value === "3d") {
		expandSpaceTime();
	}
	currentTransformation = value;
}

function sendToSimulation (data, name) {
	currentDataset = data;
	// currentDashboard = name === "combined" ? dashboardCombined : dashboardH1;
	currentDashboard =  dashboardCombined;
	// jQuery('.graph-container.'+name).addClass('shown');
	renderDataPerspective(currentDataset);
}

function renderDataPerspective(d) {
	data = d;
	dataRendered = true;
	jQuery('.loading').addClass('done');
	setTimeout(function(){
		createBlackHoles(d);
	},100);
}

function sendBlackHolesToSimulation (BHdataSets, callback) {
	if (BHdataSets.length < 2) {
		callback();
	}
	else {
		BHdataSets.forEach(function(d) {
			if (d.name === "separation") {
				separationData = d.data;
			}
			else if (d.name === "velocity") {
				velocityData = d.data;
			}
		});
		// setTimeout(function(){
		// 	createBlackHoles(currentDataset);
		// },0);
	}
}

function renderDataSpline(d) {
	var mat = new THREE.LineBasicMaterial({
		color: Colors.white
	});
	var geom = new THREE.Geometry();
	var line = new THREE.Line(geom, mat);
	for (vector in d) {
		geom.vertices.push(
			new THREE.Vector3(
				d[vector].x,
				d[vector].y,
				0
			)
		);
	}
	scene.add(line);
}

function init() {
	createScene();
	createLights();
	loadData();
	createSpaceTime();
	// createBlackHOles();
	setTimeout(function(){
		loop();
	},10);
}

init();
