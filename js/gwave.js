// GLOBAL

// Scene variables
var Colors = {
	black: 0x000000,
	white: 0xFFFFFF,
	blue: 0x0000FF,
	green: 0x2ECC71
};
var container, controls, camera, fieldOfView, aspectRatio, nearPlane, farPlane, hemisphereLight, mesh, geometry, HEIGHT, WIDTH;

// Data
var dataRendered = false;
var dataSetH1, dataSetTemplate, data;
var h1Enabled = true, templateEnabled = false;

// Animation
var counterStart = 1; // Must be higher than 0
var running = true;
var counter = counterStart;
var speed = 2;
var phaseOff;

// Controls
var currentTransformation = "3d";
var currentRenderStyle = "nodes";
var currentDataset;
var currentDashboard = dashboardTemplate;

// Space array rendering
var nodeArray = [], nodeParent;
var expandedNodeWidth,
		expandedNodeHeight,
		expandedNodeDepth,
		expandedNodeSpread,
		expandedNodeFalloff;

var cubeArray = [],
		cubeVertices = [],
		meshVertices = [];

// Optimal settings for 16384hz resolution datasets
var friction = .25,
		cubeSize = 800,
		cubeRes = 0.075,
		cubeSpread = 100, // distance between cube layers
		cubeSpeed = speed - 1,
		nodeSpread = 100,
		nodeParticleSize = 5,
		nodeRes = 1,
		nodeFalloff = 2, // Wiggliness.  Higher than 2 will make points erratic during peak.
		meshFalloff = 10,
		flatAmp = 10, // Extra kick multiplier for planar space wave rendering
		maxMeshDistance = getDist(cubeSize, cubeSize, cubeSize),
		nodeWidth = cubeSize/nodeSpread*2, // Rendering will be slow without the *0.1
		nodeHeight = cubeSize/nodeSpread*2,
		nodeDepth = cubeSize/nodeSpread*2,
		maxNodeDistance = getDist(nodeWidth*2*nodeSpread, nodeHeight*.5*nodeSpread, nodeDepth*2*nodeSpread);

var planeCameraPos = { x: 1110.51380089235,
											 y: 26.691407694486042,
											 z: 863.5923035685921 },
		cubeCameraPos = { x: 920,
											y: 692,
											z: 809 };



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
	scene.fog = new THREE.Fog(Colors.black, 0, 3000);

	// Renderer setup
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(WIDTH, HEIGHT);
	// renderer.autoClear = false;
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);
	jQuery('.transform').on('click', function(){
		friction = .25;
		running = false;
		jQuery('.transform').toggleClass('selected');
		// destroySpaceTime();
		// currentTransformation = jQuery(this).attr('value');
		// createSpaceTime();
		var thisTransform = jQuery(this);

		// setTimeout(function(){
			transformSpaceTime(jQuery(this));
			// counter = counterStart
		// },1);
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
		jQuery(this).toggleClass('playing');
	});

	jQuery('.reset').on('click', function(){
		resetSpaceTime();
	});

	jQuery('.render-style').on('click', function(){
		friction = .25;
		var newStyle = jQuery(this).attr('value');
		jQuery('.render-style').toggleClass('selected');
		if (currentRenderStyle !== newStyle) {
			destroySpaceTime();
			currentRenderStyle = jQuery(this).attr('value');
			createSpaceTime();

			if (jQuery('.transform.selected').attr('value') !== '3d') {
				setTimeout(function(){
					transformSpaceTime(jQuery('.transform.selected'));
				},0);
			}
		}
		// resetSpaceTime();
		// counter = counterStart;
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

	jQuery('.data-picker .button').on('click', function(){
		currentDashboard = jQuery(this).attr('value') === "template" ? dashboardTemplate : dashboardH1;
		jQuery('.graph-container').toggleClass('shown');
		jQuery('.data-picker .button').toggleClass('selected');
		retrieveDataset(jQuery(this).attr('value'));
		resetSpaceTime();
	});
}

function resetSpaceTime() {
	if (currentRenderStyle === "mesh") {
		meshVertices.forEach(function(v) {
			// if (v.parentVisibility) {
				v.reset();
			// }
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


function loop() {
	camera.lookAt(scene.position);
	controls.update();

	if (dataRendered) {
		if (currentRenderStyle === "mesh") {

			// Use this for 16384hz data
			if (meshVertices[0]) {
				meshVertices[0].checkForReset(phaseOff, counter+1);
			}
			meshVertices.forEach(function(v) {
				if (v.parentVisibility) {
					phaseOff = Math.round((maxMeshDistance - v.distance+1) * meshFalloff / cubeSpread);
					v.updateMeshVertex(phaseOff, counter);
				}
			});

		}
		else {
			nodeArray.forEach(function(n) {
				phaseOff = Math.round((maxNodeDistance -n.distance+1)*nodeFalloff/nodeSpread);
				n.updateNode(phaseOff, counter);
			});
		}

		if (currentDashboard) {
			currentDashboard.updatePosition(counter);
		}
	}
	setTimeout(function(){
		counter += speed;
		render();
		if (running) {	requestAnimationFrame(loop);}
	},1000/60);
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
		// for (j=nodeHeight*-0.5; j<nodeHeight*0.5; j++) {
			for (k=nodeDepth*-0.5; k<nodeDepth*0.5; k++) {
				createNode(i, 1, k, nodeSpread);
			}
		// }
	}
	maxNodeDistance = getDist(nodeWidth*1*nodeSpread, nodeHeight*.5*nodeSpread, nodeDepth*1*nodeSpread);
}

function createPlaneMesh() {
	console.log('creating plane mesh');
	console.log(cubeArray);
	// console.log('cube width: ' + cubeSize);
	createPlane(cubeSize*3, cubeRes*.25);
	setTimeout(function() {
		// cubeArray.forEach(function(cube) {

			var cube = cubeArray[0];
			var vertices = cube.children[0].geometry.vertices;
			vertices.forEach(function(v) {
				var meshVertex = new MeshVertex(v, cube, vertices.indexOf(v));
				meshVertices.push(meshVertex);
			})
		// });
	}, 0);
}

function createPlane(size, res) {
	console.log('creating plane');
	this.mesh = new THREE.Object3D();
	console.log('got here 1');
	var geom = new THREE.CubeGeometry(size, 1, size, size*res, size*res, size*res);
	console.log('got here 2');
	var mat = new THREE.MeshPhongMaterial({
		wireframe: true,
		color: Colors.white
	});
	console.log('got here 3');
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
	friction = 6;
	if (currentRenderStyle === "mesh") {
		meshFalloff = 20;
		// cubeArray.forEach(function(cube) {
		// 	if (cubeArray.indexOf(cube) !== cubeArray.length-1) {
		// 		cube.visible = false;
		// 	}
		// });
		// meshVertices.forEach(function(vertex) {
		// 	if (vertex.parentVisibility) {
		// 		vertex.flatten();
		// 	}
		// });
		destroySpaceTime();
		cubeArray = [];
		setTimeout( function() {
			createPlaneMesh();
		},10);
		maxMeshDistance = getDist(cubeSize, flatAmp, cubeSize);
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
		meshFalloff = 10;
		// console.log(meshVertices);
		// meshVertices.forEach(function(vertex) {
		// 	if (vertex.parentVisibility) {
		// 		console.log('vertex expand');
		// 		vertex.expand();
		// 	}
		// });
		// console.log(cubeArray);
		// cubeArray.forEach(function(cube) {
		// 	console.log(cube.visible);
		// 	if (cube.visible = false) {
		// 		console.log('set to visible');
		// 		cube.visible = true;
		// 	}
		// });
		destroySpaceTime();
		cubeArray = [];
		createCubeMesh();
		maxMeshDistance = getDist(cubeSize, cubeSize, cubeSize);
	}
	else if (currentRenderStyle === "nodes") {
		destroySpaceTime();
		nodeArray = [];
		createNodeArray();
	}
	// camera.position.x = cubeCameraPos.x;
	// camera.position.y = cubeCameraPos.y;
	// camera.position.z = cubeCameraPos.z;
}

function transformSpaceTime(e) {
	var value = jQuery(e).attr('value');
	console.log(value);
	if (value === "2d") {
		flattenSpaceTime();
	}
	else if (value === "3d") {
		expandSpaceTime();
	}
	currentTransformation = value;
	// console.log(currentTransformation);
}

function sendToSimulation (data, name) {
	currentDataset = data;
	currentDashboard = name === "template" ? dashboardTemplate : dashboardH1;
	jQuery('.graph-container.'+name).addClass('shown');
	renderDataPerspective(currentDataset);
}

function renderDataPerspective(d) {
	data = d;
	dataRendered = true;
	jQuery('.loading').addClass('done');
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
	},10);
}

init();
