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


// var BhVertex = function(vertex, parent, index) {
// 	this.initialX = vertex.x;
// 	this.initialY = vertex.y;
// 	this.initialZ = vertex.z;
// 	this.parentShape = parent.mesh.children[0].geometry;
// 	this.indexInParent = index;
//
//     this.updateMeshVertex = function(counter){
//         this.initialVector = getInitialDist(this.initialX, this.initialY, this.initialZ, this.parentShape.vertices[this.indexInParent].x, this.parentShape.vertices[this.indexInParent].y, this.parentShape.vertices[this.indexInParent].z);
//
//         this.distance = getInitialDist(0, 0, 0, this.parentShape.vertices[this.indexInParent].x, this.parentShape.vertices[this.indexInParent].y, this.parentShape.vertices[this.indexInParent].z);
//
//         initVecX = this.initialVector[1].x ? this.initialVector[1].x : 0;
// 		initVecY = this.initialVector[1].y ? this.initialVector[1].y : 0;
// 		initVecZ = this.initialVector[1].z ? this.initialVector[1].z : 0;
//
//         var phaseOff = Math.round((62-this.distance[0]+1)*meshFalloff);
//         var bhDataDampen = -.01;
//
//         this.dataMovement = (data[phaseOff+counter]) ? (counter * dataDampen  * data[phaseOff+counter].waveVal) : 0;
//
//         this.parentShape.vertices[this.indexInParent].x +=
//         this.dataMovement * bhDataDampen * ((1-data.length/counter));
//
//         this.parentShape.vertices[this.indexInParent].y += this.dataMovement * bhDataDampen * ((1-data.length/counter));
//
//         this.parentShape.vertices[this.indexInParent].z += this.dataMovement * bhDataDampen * ((1-data.length/counter));
//
//         this.parentShape.verticesNeedUpdate = true;
//     }
//     this.reset = function(){
//         this.parentShape.vertices[this.indexInParent].x = this.initialX;
//         this.parentShape.vertices[this.indexInParent].y = this.initialY;
//         this.parentShape.vertices[this.indexInParent].z = this.initialZ;
//         this.parentShape.verticesNeedUpdate = true;
//     }
// }

var Binary = function() {
    this.mesh = new THREE.Object3D();

    mirrorA = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color: 0x777777 } );

  	mirrorB = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color: 0x777777 } );

    blackHoleA = new BlackHole(bhaSize, "a", mirrorA); //Initial size in solar
    this.mesh.add(blackHoleA.mesh);

    blackHoleB = new BlackHole(bhbSize, "b", mirrorB); //Initial size in solar
    this.mesh.add(blackHoleB.mesh);

    // var bhVertices = blackHoleB.mesh.children[0].geometry.vertices;
    // bhVertices.forEach(function(v) {
    //     var bhVertex = new BhVertex(v, blackHoleB, bhVertices.indexOf(v));
    //     blackHoleVertices.push(bhVertex);
    // })

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

          if (this.mesh.children[1].children[0].scale.x !== 1) {
              this.mesh.children[1].children[0].scale.set(1,1,1);
          }

          this.mesh.rotation.y -= gwData[counter-1].holeVel * rotationSpeed;

          if (currentTransformation === "3d") {
            this.mesh.rotation.x -= gwData[counter-1].holeVel * 0.5 * rotationSpeed;
          }
          else if (this.mesh.rotation.x !== 0){
            this.mesh.rotation.x = 0;
          }

          this.mesh.children[0].children[0].position.x = (gwData[counter-1].holeDist*radius) - radius;

          this.mesh.children[1].children[0].position.x =  (gwData[counter-1].holeDist*radius*-1) + radius;
		  currentSeparation = (gwData[counter-1].holeDist*radius)*2;
        }
        else {
            // if (!rotationReset) {
            // this.mesh.rotation.x = 0;
            // this.mesh.rotation.y = 0;
            // rotationReset = true;
            // }

            merged = true;
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

            // this.mesh.rotation.y -= rotationSpeed;

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
