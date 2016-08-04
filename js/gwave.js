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
	// if (scene.line) {
	// 	camera.lookAt(scene.line.position);
	// }
	// else {
		camera.lookAt(scene.position);
	// }
	controls.update();
	render();
	requestAnimationFrame(loop);
}

function render() {
	renderer.render( scene, camera );
}



function renderData(d) {
	// console.log(d);
	// var anchorMesh = new THREE.Object3D();
	// var geom = new THREE.SphereGeometry(2, 20, 20);
	// var mat = new THREE.MeshPhongMaterial ({
	// 	wireframe: true,
	// 	color: Colors.white
	// });
	// var anchor = new THREE.Mesh(geom, mat);
	// anchorMesh.add(anchor);
	// scene.add(anchorMesh);


	var pathMat = new THREE.LineBasicMaterial({
		color: Colors.white
	});
	var pathGeom = new THREE.Geometry();
	var line = new THREE.Line(pathGeom, pathMat);
	var counter = 0;
	for (vector in d) {
		// if (counter % 1000 == 0) {
		// 	console.log(Math.sin(d.indexOf(d[vector])));
		// }
		// console.log(d.indexOf(d[vector]));
		// console.log(d[vector].x);
		pathGeom.vertices.push(
			new THREE.Vector3 (
				d[vector].x,
				d[vector].y,
				0
				// Math.sin(counter)
			)
		);
		counter ++;
	}
	scene.add(line);
}

function init() {
	createScene();
	createLights();
	loadData();
	loop();
}

init();
