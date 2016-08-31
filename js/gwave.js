// Config
var Colors = {
	black: 0x000000,
	blue: 0x0000FF,
	blue2: 0x3E529F,
	white: 0xFFFFFF
};

var container, controls, camera, fieldOfView, aspectRatio, nearPlane, farPlane;
var hemisphereLight, shadowLight, mesh, geometry, HEIGHT, WIDTH;
var mousePos = {
	x: 0,
	y: 0
};
var dataRendered = false;
var data;
var nodeArray = [];
var running = true;
var counterStart = 0;

// Global Settings //
var arrWidth = 20;
var arrHeight = 10;
var arrDepth = 30;
var spread = 10;
var nodeSize = 1;
var nodeRes = 2;
var delay = 0;
var newDataFrame;
var currentTransformation = "3d";
var currentRenderStyle = "mesh";

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
	cubeWidth = 1000,
	cubeHeight = 1000,
	cubeDepth = 1000,
	cubeRes = 60,
	cubeSpread = 200,
	falloff = 10, // Wiggliness
	flatAmp = 100
	maxDistance = getDist(cubeWidth, cubeHeight, cubeDepth);

var cubeArray = [],
	cubeVertices = [],
	meshVertices = [];

var lerpDuration = 6;

function createScene() {
	// DOM setup
	var container = document.createElement('div');
	document.body.appendChild(container);
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
	camera.position.x = 674.5499379335383;
	camera.position.y = 455.79374822365133;
	camera.position.z = 725.1969323235292;
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
	scene.fog = new THREE.Fog(Colors.blue, 0, 2000);

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
		running = false;
		meshVertices.forEach(function(v) {
			v.reset();
		})
		uiControls(jQuery(this));
		setTimeout(function(){
			running = true;
			render();
			loop();
		},1);
	});
	jQuery('.pause').on('click', function(){
		running = !running;
		if (running) {
			loop();
		}
	});
	jQuery('.reset').on('click', function(){
		meshVertices.forEach(function(v) {
			v.reset();
		})
	});
	jQuery('.render-style').on('click', function(){
		var newStyle = jQuery(this).attr('value');
		if (currentRenderStyle !== newStyle) {
			currentRenderStyle = jQuery(this).attr('value');
			destroySpaceTime();
			createNodeArray();
		}

		// running = false;
		console.log(currentRenderStyle);
	});
}

function createLights() {
	// A hemisphere light is a gradient colored light;
	// the first parameter is the sky color, the second parameter is the ground color,
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(Colors.pink, Colors.blue, 1);
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

			// Use this for 16384hz data
			meshVertices.forEach(function(v) {
				if (v.parentVisibility) {
					phaseOff = Math.round((maxDistance - v.distance+1) * falloff / cubeSpread);
					v.updateMeshVertex(phaseOff);
				}
			});

			// Send phase to dashboard
			var phase = meshVertices[0].counter;

			dashboard.updatePosition(phase);

		}

	}

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
	var geom = new THREE.CubeGeometry(size, size, size, res, res, res);
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
	if (currentRenderStyle === "nodes") {
		cubeArray.forEach(function(cube) {
			scene.remove(cube);
		});
		cubeArray = [];
		meshVertices = [];
	}
	console.log(cubeArray);
}

function flattenSpaceTime(){
		cubeArray.forEach(function(cube) {
			if (cubeArray.indexOf(cube) !== cubeArray.length-1) {
				cube.visible = false;
			}
		})
		//
}

function expandSpaceTime(){
	cubeArray.forEach(function(cube) {
		if (!cube.visible) {
			cube.visible = true;
		}
	})
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

function uiControls(e) {
	var value = jQuery(e).attr('value');
	if (value === "2d" && currentTransformation !== value) {
		flattenSpaceTime();
		meshVertices.forEach(function(node) {
			if (node.parentVisibility) {
				node.flatten();
			}
		});
	}
	else if (value === "3d" && !currentTransformation !== value) {
		meshVertices.forEach(function(node) {
			if (node.parentVisibility) {
				node.expand();
			}
			expandSpaceTime();
		});
	}
	currentTransformation = value;
}

function init() {
	createScene();
	createLights();
	loadData();
	createCubeMesh();
	setTimeout(function(){
		loop();
	},0);
}

init();
