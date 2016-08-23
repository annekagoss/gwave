// Config
var Colors = {
	black:0x000000,
	blue:0x0000FF,
	blue2:0x3E529F,
	white:0xFFFFFF
};

var container, controls, camera, fieldOfView, aspectRatio, nearPlane, farPlane;
var hemisphereLight, shadowLight, mesh, geometry, HEIGHT, WIDTH;
var mousePos = { x: 0, y: 0 };
var dataRendered = false;
var data;
var nodeArray = [];

// Global Settings //
var arrWidth = 20;
var arrHeight = 10;
var arrDepth = 30;
var spread = 10;
var nodeSize = 1;
var nodeRes = 2;
var delay = 0;
var falloff = 1/spread;
var friction = 0.125;

function createScene() {
	// DOM setup
	var container = document.createElement( 'div' );
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
	camera.position.x = 42.6961183872563;
	camera.position.y = 28.84978967449806;
	camera.position.z = 45.901855941777896;
	camera.rotation = (-0.5611195939970497,0.667090950310542,0.2763639986659358);

	controls = new THREE.TrackballControls( camera );

	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	// controls.noZoom = false;
	// controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [ 65, 83, 68 ];
	controls.addEventListener( 'change',  render );

	// Scene setup
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(Colors.blue, -400, 800);

	// Renderer setup
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
	});

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( WIDTH, HEIGHT );
	renderer.autoClear = false;
	container.appendChild(renderer.domElement);

	window.addEventListener( 'resize', onWindowResize, false );
}

function createLights() {
	// A hemisphere light is a gradient colored light;
	// the first parameter is the sky color, the second parameter is the ground color,
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(Colors.pink,Colors.blue, 1);
	hemisphereLight.position.set(0, -25, 0);
	scene.add(hemisphereLight);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	controls.handleResize();
}

function loop() {
	camera.lookAt(scene.position);
	controls.update();

	if (dataRendered) {
		for (n = 0; n < nodeArray.length; n++) {
			var phaseOff = Math.floor(nodeArray[n].distance*falloff);
			nodeArray[n].updateNode(phaseOff);
		}
	}

	render();
	setTimeout(function() {
		requestAnimationFrame(loop);
	}, delay);
}

function render() {
	renderer.render( scene, camera );
}

function renderData(d) {
	var mat = new THREE.LineBasicMaterial({
		color: Colors.white
	});
	var geom = new THREE.Geometry();
	var line = new THREE.Line(geom, mat);
	for (vector in d) {
		geom.vertices.push(
			new THREE.Vector3 (
				d[vector].x,
				d[vector].y,
				0
			)
		);
	}
	scene.add(line);
	data = d;
	dataRendered = true;
}

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
	this.previousOffset = 0;

	var counter = 1000;

	this.updateNode = function(phaseOffset) {
		if (phaseOffset+counter >= data.length-1000) { counter = 1000; }
		// console.log("phase offset: " + phaseOffset);
		// console.log("counter: " + counter);
		// this.mesh.position.x = data[co;unter+phaseOffset].x;
		this.mesh.position.y = this.initialHeight + this.initialHeight * friction * data[phaseOffset+counter].y;
		this.mesh.position.x = this.initialWidth + this.initialWidth * friction * data[phaseOffset+counter].y;
		this.mesh.position.z = this.initialDepth + this.initialDepth * friction * data[phaseOffset+counter].y;
		this.distance = getDist(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
		this.previousOffset = phaseOffset;
		counter ++;
	}
}

function createNodeArray(){
	for (i=arrWidth*-0.5; i<arrWidth*0.5; i++) {
		for (j=arrHeight*-0.5; j<arrHeight*0.5; j++) {
			for (k=arrDepth*-0.5; k<arrDepth*0.5; k++) {
				createNode(i, j, k, spread);
			}
		}
	}
}
function getDist(x, y, z) {
	var dist = Math.sqrt((x*x) + (y*y) + (z*z));
	var nodeDist = dist ? dist : 0;
	return nodeDist;
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
	scene.add(this.mesh);
	nodeArray.push(this.node);
}

function init() {
	createScene();
	createLights();
	loadData();
	// createNode();
	createNodeArray();
	loop();
}

init();
