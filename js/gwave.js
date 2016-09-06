// Config
var Colors = {
	black: 0x000000,
	blue: 0x0000FF,
	blue2: 0x3E529F,
	white: 0xFFFFFF,
	green: 0x2ECC71
};

var container, controls, camera, fieldOfView, aspectRatio, nearPlane, farPlane;
var hemisphereLight, shadowLight, mesh, geometry, HEIGHT, WIDTH;
var mousePos = {
	x: 0,
	y: 0
};
var dataRendered = false;
var dataSetH1, dataSetTemplate, data;
var h1Enabled = true;
var templateEnabled = false;
var nodeArray = [];
var running = true;
// var counterStart = 4500; // Must be higher than 0
var counterStart = 2;
var nodeParent;
var counter = counterStart;

// Global Settings //
// var arrWidth = 20;
// var arrHeight = 10;
// var arrDepth = 30;
// var spread = 10;
// var nodeSize = 1;
//
var delay = 0;
var newDataFrame;
var currentTransformation = "3d";
var currentRenderStyle = "nodes";
var currentDataset;
var currentDashboard;
var speed = 1;

// 4096hz settings
// var friction = .125,
// 	cubeWidth = 1000,
// 	cubeHeight = 1000,
// 	cubeDepth = 1000,
// 	cubeRes = 60,
// 	cubeSpread = 500,
// 	falloff = 10, // Wiggliness
// 	flatAmp = 100;

// 16384hz settings
var friction = .25,
	cubeWidth = 800,
	cubeHeight = 800,
	cubeDepth = 800,
	cubeRes = 0.075,
	cubeSpread = 100,
	cubeSpeed = speed - 1,
	nodeSpread = 50,
	nodeSize = 5,
	nodeRes = 1,
	nodeFalloff = 2, // Wiggliness.  Higher than 2 will make points erratic during peak.
	meshFalloff = 2,
	flatAmp = 10,
	distBoundary = 0,
	maxMeshDistance = getDist(cubeWidth, cubeHeight, cubeDepth),
	nodeWidth = cubeWidth/nodeSpread*1, // Rendering will be slow without the *0.1
	nodeHeight = cubeHeight/nodeSpread*1,
	nodeDepth = cubeDepth/nodeSpread*1,
	maxNodeDistance = getDist(nodeWidth*1*nodeSpread, nodeHeight*.5*nodeSpread, nodeDepth*1*nodeSpread);

	var expandedNodeWidth, expandedNodeHeight, expandedNodeDepth, expandedNodeSpread, expandedNodeFalloff;

var cubeArray = [],
	cubeVertices = [],
	meshVertices = [];

var lerpDuration = 6;

function createScene() {
	// DOM setup
	var container = document.createElement('div');
	jQuery('body').prepend(container);
	container.className = 'container';

	// Camera setup
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
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
	// camera.position.x = 0;
	// camera.position.y = 0;
	// camera.position.z = 20;
	camera.position.x = 303;
	camera.position.y = 205;
	camera.position.z = 326;
	camera.rotation = (-0.5611195939970497, 0.667090950310542, 0.2763639986659358);

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
	scene.fog = new THREE.Fog(Colors.black, 0, 3000);

	// Renderer setup
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(WIDTH, HEIGHT);
	renderer.autoClear = false;
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);
	jQuery('.transform').on('click', function(){
		friction = .25;
		running = false;
		transformSpaceTime(jQuery(this));
		setTimeout(function(){
			running = true;
			render();
			loop();
		},0);
	});
	jQuery('.pause').on('click', function(){
		running = !running;
		if (running) {
			loop();
		}
	});
	jQuery('.reset').on('click', function(){
		resetSpaceTime();
	});
	jQuery('.render-style').on('click', function(){
		friction = .25;
		currentTransformation = "3d";
		var newStyle = jQuery(this).attr('value');
		if (currentRenderStyle !== newStyle) {
			destroySpaceTime();
			currentRenderStyle = jQuery(this).attr('value');
			createSpaceTime();
		}
	});
	jQuery('.slider').on('mousedown', function() {
		controls.enabled = false;
	});

	jQuery('.speed-val').text(speed);
	jQuery('.slider').val(speed);
	jQuery('.slider').on('mouseup', function(e) {
		running = false;
		resetSpaceTime();
		speed = e.target.valueAsNumber;
		jQuery('.speed-val').text(speed);
		controls.enabled = true;
		setTimeout(function() {
			running = true;
			render();
			loop();
		},0);
	});
}

function resetSpaceTime() {
	if (currentRenderStyle === "mesh") {
		meshVertices.forEach(function(v) {
			if (v.parentVisibility) {
				v.reset();
			}
		});
	}
	else if (currentRenderStyle === "nodes") {
		nodeArray.forEach(function(n){
			n.reset();
		});
	}
}

function createLights() {
	// A hemisphere light is a gradient colored light;
	// the first parameter is the sky color, the second parameter is the ground color,
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(Colors.blue, Colors.green, 1);
	hemisphereLight.position.set(0, 0, 0);
	scene.add(hemisphereLight);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.handleResize();
}
var frame = 0;
var posDataUpdated = false;
var phaseOff;

function loop() {
	camera.lookAt(scene.position);
	controls.update();

	if (frame === lerpDuration) {
		frame = 0;
	}

	if (frame / lerpDuration === 0) {
		posDataUpdated = false;
	}

	if (dataRendered) {
		if (currentRenderStyle === "mesh") {

			// Use this to animate using lerp for 4096hz data
			// if (!posDataUpdated) {
			// 	for (n = 0; n <= meshVertices.length - 1; n++) {
			// 		phaseOff = Math.round(meshVertices[n].distance * falloff / cubeSpread);
			// 		meshVertices[n].updatePositionData(phaseOff);
			// 		if (n === meshVertices.length - 1) {
			// 			posDataUpdated = true;
			// 		}
			// 	}
			// } else {
			// 	for (n = 0; n <= meshVertices.length - 1; n++) {
			// 		meshVertices[n].moveWithLerp();
			// 	}
			// }

			// console.log(Math.round((maxMeshDistance - meshVertices[0].distance+1)*meshFalloff/cubeSpread));
			// console.log(meshVertices[0]);


			// Use this for 16384hz data
			meshVertices.forEach(function(v) {
				if (v.parentVisibility) {
					phaseOff = Math.round((maxMeshDistance - v.distance+1) * meshFalloff / cubeSpread);
					v.updateMeshVertex(phaseOff, counter);
				}
			});
			if (meshVertices[0]) {
				meshVertices[0].checkForReset(phaseOff, counter);
			}

		}
		else {
			// console.log((maxNodeDistance - nodeArray[0].distance+1));
			// console.log(nodeArray.length);

			nodeArray.forEach(function(n) {
				phaseOff = Math.round((maxNodeDistance - n.distance+1)*nodeFalloff/nodeSpread);
				n.updateNode(phaseOff, counter);
			});
		}

		currentDashboard.updatePosition(counter);
	}

	counter += speed;
	frame++;
	render();
	if (running) {	requestAnimationFrame(loop);}
}

function getDist(x, y, z) {
	var dist = Math.sqrt((x * x) + (y * y) + (z * z));
	var nodeDist = dist ? dist : 0;
	return nodeDist;
}

function lerpPosition(posA, posB, duration, f) {
	var t = f / duration;
	var newPos = posA + t * (posB - posA);
	return newPos;
}

function render() {
	renderer.render(scene, camera);
}


function createNode(xVal, yVal, zVal, spread) {
	this.mesh = new THREE.Object3D();
	var node = new Node();
	node.mesh.position.x = xVal*spread;
	node.mesh.position.y = yVal*spread;
	node.mesh.position.z = zVal*spread;
	node.initialWidth = xVal*spread;
	node.initialHeight = yVal*spread;
	node.initialDepth = zVal*spread;
	node.distance = getDist(xVal*spread, yVal*spread, zVal*spread);

	this.mesh.add(node.mesh);
	this.node = node;
	scene.add(node.mesh);
	nodeArray.push(this.node);
}

function createNodeArray() {
	nodeSpread = expandedNodeSpread ? expandedNodeSpread : nodeSpread;
	nodeWidth = expandedNodeWidth ? expandedNodeWidth : nodeWidth;
	nodeHeight = expandedNodeHeight ? expandedNodeHeight : nodeHeight;
	nodeDepth = expandedNodeDepth ? expandedNodeDepth : nodeDepth;
	nodeFalloff = expandedNodeFalloff ? expandedNodeFalloff : nodeFalloff;

	for (i=nodeWidth*-0.5; i<nodeWidth*0.5; i++) {
		for (j=nodeHeight*-0.5; j<nodeHeight*0.5; j++) {
			for (k=nodeDepth*-0.5; k<nodeDepth*0.5; k++) {
				createNode(i, j, k, nodeSpread);
			}
		}
	}
}

function createNodePlane() {
	expandedNodeSpread = nodeSpread;
	nodeSpread *= 0.5;
	expandedNodeWidth = nodeWidth;
	nodeWidth *= 5;
	expandedNodeHeight = nodeHeight;
	nodeHeight = 0.5;
	expandedNodeDepth = nodeDepth;
	nodeDepth *= 5;
	expandedNodeFalloff = nodeFalloff;
	nodeFalloff = 2;

	for (i=nodeWidth*-0.5; i<nodeWidth*0.5; i++) {
		for (j=nodeHeight*-0.5; j<nodeHeight*0.5; j++) {
			for (k=nodeDepth*-0.5; k<nodeDepth*0.5; k++) {
				createNode(i, j, k, nodeSpread);
			}
		}
	}
	maxNodeDistance = getDist(nodeWidth*1*nodeSpread, nodeHeight*.5*nodeSpread, nodeDepth*1*nodeSpread);
}

function createCubeMesh() {
	for (i = 0; i < cubeWidth; i += cubeSpread) {
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
}

function createSpaceTime() {
	if (currentRenderStyle === "mesh") {
		createCubeMesh();
	}
	else if (currentRenderStyle === "nodes") {
		createNodeArray();
	}
}

function flattenSpaceTime(){
	// console.log(currentRenderStyle);
	friction = 6;
	if (currentRenderStyle === "mesh") {

		cubeArray.forEach(function(cube) {
			if (cubeArray.indexOf(cube) !== cubeArray.length-1) {
				cube.visible = false;
			}
		})
		meshVertices.forEach(function(vertex) {
			if (vertex.parentVisibility) {
				vertex.flatten();
			}
		});
		maxMeshDistance = getDist(cubeWidth, flatAmp, cubeDepth);
	}
	else if (currentRenderStyle === "nodes") {
		destroySpaceTime();
		nodeArray = [];
		createNodePlane();
	}
}

function expandSpaceTime(){
	if (currentRenderStyle === "mesh") {
		meshVertices.forEach(function(vertex) {
			if (vertex.parentVisibility) {
				vertex.expand();
			}
		});
		cubeArray.forEach(function(cube) {
			if (!cube.visible) {
				cube.visible = true;
			}
		});
		maxMeshDistance = getDist(cubeWidth, cubeHeight, cubeDepth)
	}
	else if (currentRenderStyle === "nodes") {
		destroySpaceTime();
		nodeArray = [];
		createNodeArray();
	}
}

function transformSpaceTime(e) {
	var value = jQuery(e).attr('value');
	if (value === "2d" && currentTransformation !== value) {
		flattenSpaceTime();
	}
	else if (value === "3d" && !currentTransformation !== value) {
		expandSpaceTime();
	}
	currentTransformation = value;
}

function setCurrentDataset() {
	currentDataset = h1Enabled === true ? dataSetH1 : dataSetTemplate;
	currentDashboard = h1Enabled === true ? dashboardH1 : dashboardTemplate;
}

function sendToSimulation (dataSet, setName) {
	if (setName = "H1") {
		dataSetH1 = dataSet;
	}
	else if (setName = "Template") {
		dataSetTemplate = dataSet;
	}
	setCurrentDataset();
	renderDataPerspective(currentDataset);
}

function renderDataPerspective(d) {
	// renderDataSpline(d);
	data = d;
	dataRendered = true;
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
	setTimeout(function(){
		loop();
	},20);
}

init();
