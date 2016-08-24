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
var newDataFrame;


// Default settings
var friction = .125,
		cubeWidth = 1000,
    cubeHeight = 1000,
    cubeDepth = 1000,
    cubeRes = 20,
    cubeSpread = 500,
		falloff = 10;  // Wiggliness

// Beautiful water droplet Settings
// var cubeWidth = 1000,
//     cubeHeight = 1000,
//     cubeDepth = 1000,
//     cubeRes = 20,
//     cubeSpread = 500;
// var falloff = 20;  // Wiggliness

// Crazy settings:
// var cubeWidth = 1000,
//     cubeHeight = 1000,
//     cubeDepth = 1000,
//     cubeRes = 100,
//     cubeSpread = 500,
// 		falloff = 10,
// 		friction = .25;

var cubeArray = [],
    cubeVertices = [],
    vertexNodes = [];

var lerpDuration = 6;

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
	// scene.fog = new THREE.Fog(Colors.blue, -400, 800);

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
	hemisphereLight.position.set(0, 0, 0);
	scene.add(hemisphereLight);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	controls.handleResize();
}

var frame = 0;

function countFrames() {
	// console.log(frame);
  frame ++;
  if (frame === lerpDuration) {
    frame = 0;
  }
	setTimeout(function(){
	  requestAnimationFrame(countFrames);
	},delay);
}

var posDataUpdated = false;
var phaseOff;
function loop() {
	camera.lookAt(scene.position);
	controls.update();


  if (frame === lerpDuration) {
    frame = 0;
  }


	if (frame/lerpDuration === 0) {
			posDataUpdated = false;
	}


  if (dataRendered) {
      // console.log(posDataUpdated);
      if (!posDataUpdated) {
        // console.log('updating position data');
        for (n = 0; n <= vertexNodes.length-1; n++) {
            phaseOff = Math.round(vertexNodes[n].distance*falloff/cubeSpread);
            vertexNodes[n].updatePositionData(phaseOff);
            if (n === vertexNodes.length-1) {
              posDataUpdated = true;
            }
          }
      }
      else {

        // console.log('lerping');
        for (n = 0; n <= vertexNodes.length-1; n++) {
    			vertexNodes[n].moveWithLerp();
          if (n === vertexNodes.length-1){
						// console.log(vertexNodes[n].finishedLerp);
						// console.log(vertexNodes[n].parentCube.vertices[vertexNodes[n].indexInParent].x - vertexNodes[n].newPositionX);
						// if (vertexNodes[n].finishedLerp) {
						// setTimeout(function() {



						// },0);
						// }
            // setTimeout(function() {
            //   posDataUpdated = false;
            // },0);

          }
    		}
      }
  }

	frame ++;

	render();
	// setTimeout(function() {
		requestAnimationFrame(loop);
	// }, delay);
}

function getDist(x, y, z) {
	var dist = Math.sqrt((x*x) + (y*y) + (z*z));
	var nodeDist = dist ? dist : 0;
	return nodeDist;
}

function lerpPosition(posA, posB, duration, f) {
  var t = f/duration;
  var newPos = posA + t * (posB - posA);
  return newPos;
}

function render() {
	renderer.render( scene, camera );
}

var VertexNode = function(vertex,parent,index) {
  this.initialX = vertex.x;
  this.initialY = vertex.y;
  this.initialZ = vertex.z;
  this.distance = getDist(vertex.x, vertex.y, vertex.z);
  this.parentCube = parent.children[0].geometry;
  this.indexInParent = index;
	this.finishedLerp = false;

  var counter = 1000;

  // Get new position from dataset to use for lerp movement
  this.updatePositionData = function(phaseOffset) {
		this.finishedLerp = false;
    if (phaseOffset+counter >= data.length-1000) {
      counter = 1000;
      // this.previousPositionX = this.initialX;
      // this.previousPositionY = this.initialY;
      // this.previousPositionZ = this.initialZ;
			//
      // this.parentCube.vertices[this.indexInParent].x = this.initialX;
      // this.parentCube.vertices[this.indexInParent].y = this.initialY;
      // this.parentCube.vertices[this.indexInParent].z = this.initialZ;
      // this.parentCube.verticesNeedUpdate = true;
    }
    // else {
      this.previousPositionX = this.parentCube.vertices[this.indexInParent].x;
      this.previousPositionY = this.parentCube.vertices[this.indexInParent].y;
      this.previousPositionZ = this.parentCube.vertices[this.indexInParent].z;
    // }

    this.newPositionX = this.initialX + (this.initialX * friction * data[phaseOffset+counter].y);
    this.newPositionY = this.initialY + (this.initialY * friction * data[phaseOffset+counter].y);
    this.newPositionZ = this.initialZ + (this.initialZ * friction * data[phaseOffset+counter].y);

    this.distance = getDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);
    counter ++;
  }

  this.moveWithLerp = function() {

      this.parentCube.vertices[this.indexInParent].x = lerpPosition(this.parentCube.vertices[this.indexInParent].x, this.newPositionX, lerpDuration, frame);
      this.parentCube.vertices[this.indexInParent].y = lerpPosition(this.parentCube.vertices[this.indexInParent].y, this.newPositionY, lerpDuration, frame);
      this.parentCube.vertices[this.indexInParent].z = lerpPosition(this.parentCube.vertices[this.indexInParent].z, this.newPositionZ, lerpDuration, frame);
      this.parentCube.verticesNeedUpdate = true;
			// console.log


			// if (this.indexInParent === 100) {
				// console.log(this.parentCube.vertices[this.indexInParent].x);
				// if (Math.floor(this.parentCube.vertices[this.indexInParent].x - this.newPositionX) === 0) {
				// 		this.finishedLerp = true;
						// console.log(frame/lerpDuration);
				// }
			// }
			// if (this.parentCube.vertices[this.indexInParent].x === this.newPositionX) {
			// 	this.finishedLerp = true;
			// }
  }

  // Movement without lerp
	this.updateVertexNode = function(phaseOffset) {
		if (phaseOffset+counter >= data.length-1000) { counter = 1000; }

		this.parentCube.vertices[this.indexInParent].x = this.initialX + this.initialX * friction * data[phaseOffset+counter].y;
    this.parentCube.vertices[this.indexInParent].y = this.initialY + this.initialY * friction * data[phaseOffset+counter].y;
    this.parentCube.vertices[this.indexInParent].z = this.initialZ + this.initialZ * friction * data[phaseOffset+counter].y;

		this.distance = getDist(this.parentCube.vertices[this.indexInParent].x, this.parentCube.vertices[this.indexInParent].y, this.parentCube.vertices[this.indexInParent].z);

		counter ++;
    this.parentCube.verticesNeedUpdate = true;
	}

}

function createCubeMesh() {
  for (i=0;i<cubeWidth;i+=cubeSpread) {
    var resolution = i < cubeRes ? i : cubeRes;
    createCube(i,resolution);
  }
  setTimeout(function() {
    cubeArray.forEach(function(cube) {
      var vertices = cube.children[0].geometry.vertices;
      vertices.forEach(function(v) {
        var vertexNode = new VertexNode(v,cube,vertices.indexOf(v));

        vertexNodes.push(vertexNode);
      })
    });
  },0);
}

function createCube(size, res){
  this.mesh = new THREE.Object3D();
	var geom = new THREE.CubeGeometry(size,size,size,res,res,res);
	var mat = new THREE.MeshPhongMaterial ({
		wireframe: true,
		color:Colors.white
	});

	var n = new THREE.Mesh(geom, mat);
	// n.castShadow = true;
	// n.receiveShadow = true;
	this.mesh.add(n);
  scene.add(this.mesh);
  cubeArray.push(this.mesh);
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

function init() {
	createScene();
	createLights();
	loadData();
  createCubeMesh();
  setTimeout(function(){
    loop();
    // countFrames();
  },0);

}

init();
