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
var newRotation;

var Binary = function() {
    this.mesh = new THREE.Object3D();

    mirrorA = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color: 0x777777 } );

  	mirrorB = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color: 0x777777 } );

    blackHoleA = new BlackHole(bhaRadius, "a", mirrorA); //Initial size in solar
    this.mesh.add(blackHoleA.mesh);

    blackHoleB = new BlackHole(bhbRadius, "b", mirrorB); //Initial size in solar
    this.mesh.add(blackHoleB.mesh);

    this.update = function(counter) {
        if (gwData[counter-1].waveSecs<0) {
          merged = false;
          massForGravity = smallMass;

          if (this.mesh.children[1].children[0].scale.x !== 1) {
              this.mesh.children[1].children[0].scale.set(1,1,1);
          }
          newRotation = angularVelToDegrees(gwData[counter-1].holeVel,gwData[counter-1].holeDist)*360*orbitalFreq/sampleRate*.25;

          this.mesh.rotation.y -= newRotation;

          if (currentTransformation === "3d") {
            this.mesh.rotation.x -= newRotation * 0.5;
          }
          else if (this.mesh.rotation.x !== 0){
            this.mesh.rotation.x = 0;
          }
            this.mesh.children[0].children[0].position.x = kmToM(gwData[counter-1].holeDist*systemRadius)*scaleFactor;
            this.mesh.children[1].children[0].position.x = kmToM(gwData[counter-1].holeDist*systemRadius*-1)*scaleFactor;
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
              this.mesh.children[1].children[0].scale.set(finalRadiusRatio, finalRadiusRatio, finalRadiusRatio);
            }
        }
    }
}

var BlackHole = function(size, name, mat) {
    this.mesh = new THREE.Object3D();
	var geom = new THREE.SphereGeometry(schwarzRadius(size),bhRes,bhRes);
    var bh = new THREE.Mesh(geom, mat.material);
    bh.add(mat);

    bh.position.x = name === "a" ? (kmToM(gwData[0].holeDist*systemRadius)*scaleFactor) : (kmToM(gwData[0].holeDist*systemRadius*-1)*scaleFactor);
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
    // blackHoleB.mesh.children[0].scale.set(bhbRadius,bhbRadius,bhbRadius);
    scene.remove(binary.mesh);
}

function createBlackHoles(currentData) {
    gwData = currentData ? currentData : gwData;

    bhaRadius = schwarzRadius(bhaMass);
    bhbRadius = schwarzRadius(bhbMass);
    finalRadius = schwarzRadius(finalMass);
    finalRadiusRatio = finalRadius/bhbRadius;
    systemRadius = schwarzRadius((bhaMass+bhbMass));

    binary = new Binary();
    binary.mesh.position.set(0,0,0);
    scene.add(binary.mesh);
    setTimeout(function(){
        blackHolesCreated = true;
    },200);
}
