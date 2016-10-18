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
var h1Enabled = false;
var templateEnabled = true;
var nodeArray = [];
var running = true;
var counterStart = 2; // Must be higher than 0
var nodeParent;
var counter = counterStart;
var simulatedPhase;

var delay = 0;
var newDataFrame;
var currentTransformation = "3d";
var currentRenderStyle = "nodes";
var currentDataset;
var currentDashboard = dashboardTemplate;
var speed = 2;

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

var effect;
var clock = new THREE.Clock();
var container, element;

function createScene() {
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
	});

	element = renderer.domElement;
	container = document.createElement('div');
	jQuery('body').prepend(container);
	container.className = 'container';
	container.appendChild(element);

	effect = new THREE.StereoEffect(renderer);

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
	camera.position.set(0, 10, 0);
	scene.add(camera);

	// Old camera setup
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;


	controls = new THREE.OrbitControls(camera, element);
	controls.rotateUp(Math.PI / 4);
	controls.target.set(
	  camera.position.x + 0.1,
	  camera.position.y,
	  camera.position.z
	);
	controls.noZoom = true;
	controls.noPan = true;

	function setOrientationControls(e) {
	  if (!e.alpha) {
		return;
	  }

	  controls = new THREE.DeviceOrientationControls(camera, true);
	  controls.connect();
	  controls.update();

	  element.addEventListener('click', fullscreen, false);

	  window.removeEventListener('deviceorientation', setOrientationControls, true);
	}

	window.addEventListener('deviceorientation', setOrientationControls, true);

	scene.fog = new THREE.Fog(Colors.black, 0, 3000);

	jQuery('.transform').on('click', function(){
		friction = .25;
		running = false;
		jQuery('.transform').toggleClass('selected');
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
		jQuery(this).toggleClass('playing');
	});
	jQuery('.reset').on('click', function(){
		resetSpaceTime();
	});
	jQuery('.render-style').on('click', function(){
		friction = .25;
		currentTransformation = "3d";
		var newStyle = jQuery(this).attr('value');
		jQuery('.render-style').toggleClass('selected');
		jQuery('.transform.expanded').addClass('selected');
		jQuery('.transform.flat').removeClass('selected');
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

	jQuery('.data-picker .button').on('click', function(){
		setDataset(jQuery(this).attr('value'));
	});

	setTimeout(resize, 1);
}

function setDataset(name) {
	currentDashboard = name === "template" ? dashboardTemplate : dashboardH1;
	jQuery('.graph-container').toggleClass('shown');
	jQuery('.data-picker .button').toggleClass('selected');
	retrieveDataset(name);
	resetSpaceTime();
}

function fullscreen() {
  if (container.requestFullscreen) {
	container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
	container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
	container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
	container.webkitRequestFullscreen();
  }
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  effect.setSize(width, height);
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

var frame = 0;
var posDataUpdated = false;
var phaseOff;

function loop() {
	// camera.lookAt(scene.position);
	// controls.update();

	if (frame === lerpDuration) {
		frame = 0;
	}

	if (frame / lerpDuration === 0) {
		posDataUpdated = false;
	}

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
	counter += speed;
	frame++;
	update(clock.getDelta());
	render(clock.getDelta());
	if (running) {	requestAnimationFrame(loop); }
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

function update(dt) {
	resize();
	camera.updateProjectionMatrix();
	controls.update(dt);
}

function render(dt) {
	effect.render(scene, camera);
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

function sendToSimulation (data, name) {
	// console.log(name);
	currentDataset = data;
	currentDashboard = name === "template" ? dashboardTemplate : dashboardH1;
	jQuery('.graph-container.'+name).addClass('shown');
	renderDataPerspective(currentDataset);
}

function renderDataPerspective(d) {
	// renderDataSpline(d);
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
	setDataset("tempalte");
	createSpaceTime();
	setTimeout(function(){
		loop();
	},10);
}

init();
