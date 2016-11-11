var cloneVec = new THREE.Vector3();
var pointColor = new THREE.Color(1,1,1);
var highlightSphere, selectedPoint;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var metersAway;

function repositionMeasurements(newX, newY) {
    jQuery('.measurements').css({
        left:newX,
        top:newY
    });
    if (jQuery('.full-opacity').length === 0) {
        jQuery('.measurements').addClass('full-opacity');
    }
}

function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    if (highlightSphere.visible) {
        repositionMeasurements(event.clientX, event.clientY);
    }
    else if (jQuery('.full-opacity').length > 0) {
        jQuery('.measurements').removeClass('full-opacity');
    }
}

function createHighlightSphere(){
	highlightSphere = new THREE.Object3D();
	var geom = new THREE.SphereGeometry(40, 15, 15);
	var mat = new THREE.MeshPhongMaterial ({
		wireframe: true,
		color: pointColor,
		transparent: true,
		opacity: 0.25
	});
	var mesh = new THREE.Mesh(geom, mat);
    mesh.name="highlightSphere";
	highlightSphere.add(mesh);
	highlightSphere.visible = false;
    highlightSphere.name="highlightSphere";

	scene.add(highlightSphere);
}

function takeMeasurement(){
    raycaster.setFromCamera( mouse, camera );
    intersects = raycaster.intersectObjects( scene.children, true);

    highlightSphere.visible = intersects.length > 0 ? true : false;

    for ( var i = 0; i < intersects.length; i++ ) {
        if (intersects[i].object.name !== "highlightSphere") {
            if(intersects[i].object.material.wireframe === true){
                intersectCoordinate(intersects[i].object);
            }
        }
    }
    highlightSphere.rotation.x+= 0.01;
}

function intersectCoordinate(point){
	cloneVec.setFromMatrixPosition(point.matrixWorld );
	pointClone = point.clone();
	highlightSphere.position.set(cloneVec.x, cloneVec.y, cloneVec.z);
	pointColor = point.material.color;
	highlightSphere.children[0].material.color.set(pointColor);
    selectedPoint = nodeArray[point.parent.name];
    setMeasurements();
}

function convertToMeters(distance) {
    // return distance;
    return maxRadius*(distance-finalSize)/(separationData[0].distance*radius);
}

// function getDistfromCenterofGravity() {
//     return getInitialDist(0,0,0, selectedPoint.position.x, selectedPoint.position.y, selectedPoint.position.z);
// }

function getAmplitude(distance) {
    inverseDistance = 1/distance;
    amplitudeAtCenter = waveValue * distFromEarth;
    return inverseDistance * amplitudeAtCenter;
}

function setMeasurements(){
    if (selectedPoint) {
        // Use the ditance form the center of gravity
        metersAway = convertToMeters(selectedPoint.bhVector[0]);
        jQuery('.measurements .distance .value').text(Math.round(metersAway));
        jQuery('.measurements .earth-force .value').html(formatStrain(waveValue));
        jQuery('.measurements .force .value').html(getAmplitude(metersAway).toFixed(5));
    }
}
