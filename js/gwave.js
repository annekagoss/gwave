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
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 20;

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
	if (dataRendered) { node.updateNode(); }
	render();
	requestAnimationFrame(loop);
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
	var geom = new THREE.SphereGeometry(0.25,10,10);
	var mat = new THREE.MeshPhongMaterial ({
		wireframe: true,
		color:Colors.white
	});

	var n = new THREE.Mesh(geom, mat);
	n.castShadow = true;
	n.receiveShadow = true;
	this.mesh.add(n);
	var counter = 1000;
	this.updateNode = function() {
		if (counter === data.length-1001) { counter = 1000; }
		this.mesh.position.x = data[counter].x;
		this.mesh.position.y = data[counter].y;
		counter ++;
	}
}

function createNode(){
	this.mesh = new THREE.Object3D();
	var node = new Node();
	this.mesh.add(node.mesh);
	this.node = node;
	scene.add(this.mesh);
}

function init() {
	createScene();
	createLights();
	loadData();
	createNode();
	loop();
}

init();
