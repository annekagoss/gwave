var binary;
var mirrorA, mirrorB;
var separationData, velocityData, minCounter, maxCounter;
var vectorA = new THREE.Vector3();
var vectorB = new THREE.Vector3();

var oneDeg = Math.PI/180;
var h1Enabled = true, templateEnabled = false;

var currentTransformation = "3d";
var currentSeparation = 1;

var gwData;

var merged = false;
var blackHolesCreated = false;
var rotationReset = false;

var blackHoleVertices = [];


var Binary = function() {
    this.mesh = new THREE.Object3D();

    mirrorA = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color: 0x777777 } );

  	mirrorB = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color: 0x777777 } );

    blackHoleA = new BlackHole(bhaSize, "a", mirrorA); //Initial size in solar
    this.mesh.add(blackHoleA.mesh);

    blackHoleB = new BlackHole(bhbSize, "b", mirrorB); //Initial size in solar
    this.mesh.add(blackHoleB.mesh);

    this.update = function(counter) {
        if (counter === 1) {
            // rotationReset = false;
            console.log('reset');
            blackHoleVertices.forEach(function(v){
               v.reset();
            });
            this.mesh.children[0].children[0].visible = true;
        }

        if (gwData[counter-1].waveSecs<0) {
          merged = false;
          massForGravity = smallMass;

          if (this.mesh.children[1].children[0].scale.x !== 1) {
              this.mesh.children[1].children[0].scale.set(1,1,1);
          }
          var newRotation = angularVelToDegrees(gwData[counter-1].holeVel,gwData[counter-1].holeDist)*5000;

          this.mesh.rotation.y -= newRotation;

          if (currentTransformation === "3d") {
            this.mesh.rotation.x -= newRotation * 0.5;
          }
          else if (this.mesh.rotation.x !== 0){
            this.mesh.rotation.x = 0;
          }

          this.mesh.children[0].children[0].position.x = (gwData[counter-1].holeDist*radius) - radius;

          this.mesh.children[1].children[0].position.x =  (gwData[counter-1].holeDist*radius*-1) + radius;
		  currentSeparation = (gwData[counter-1].holeDist*radius)*2;
        }
        else {
            merged = true;
            massForGravity = largeMass;
            this.mesh.children[0].children[0].position.x = 0;

            if (this.mesh.children[0].children[0].visible === true) {
               this.mesh.children[0].children[0].visible = false;
            }

            this.mesh.children[1].children[0].position.x = 0;
            this.mesh.children[1].children[0].position.y = 0;
            this.mesh.children[1].children[0].position.z = 0;

            if (this.mesh.children[1].children[0].scale.x === 1) {
              this.mesh.children[1].children[0].scale.set(finalSize/bhaSize,finalSize/bhaSize,finalSize/bhaSize);
            }
            blackHoleVertices.forEach(function(v){
            v.updateMeshVertex(counter);
            });

        }
    }
}

var BlackHole = function(size, name, mat) {
    this.mesh = new THREE.Object3D();
	var geom = new THREE.SphereGeometry(size,bhRes,bhRes);
    var bh = new THREE.Mesh(geom, mat.material);
    bh.add(mat);

    bh.position.x = name === "a" ? (separationData[0].distance * radius) : (separationData[0].distance * radius *-1);
    bh.position.y = (currentTransformation === "3d") ? 0 : flatAmp;

    this.mesh.add(bh);
}



function calibrateCounter(gwData) {
    minCounter = 1; // coutnerStart
    var positiveData = jQuery.grep(gwData, function(d, i) {
		return d.x > 0;
	});
    var max = positiveData[0];
    maxCounter = gwData.indexOf(max);
}

function destroyBlackHoles() {
    blackHolesCreated = false;
    blackHoleB.mesh.children[0].scale.set(bhbSize,bhbSize,bhbSize);
    scene.remove(binary.mesh);
}

function createBlackHoles(currentData) {
    gwData = currentData ? currentData : gwData;
    calibrateCounter(gwData);
    // parseDataTimes(gwData);
    binary = new Binary();
    binary.mesh.position.set(0,0,0);
    scene.add(binary.mesh);
    setTimeout(function(){
        blackHolesCreated = true;
    },200);
}
