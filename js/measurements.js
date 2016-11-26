var cloneVec = new THREE.Vector3();
var pointColor = new THREE.Color(1,1,1);
var intersects, highlightSphere, selectedPoint, pointLocked = false, lockedPoint, tempPoint;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var metersAway, offScreen;
var unlockText = 'click to unlock coordinate', lockText = 'click to lock coordinate';

function repositionMeasurements(newX, newY) {
    jQuery('.measurements').css({
        left:newX,
        top:newY
    });

    offScreen = (jQuery('.measurements').offset().left) + (jQuery('.measurements').width()) + (jQuery('.flipped').width()) - window.innerWidth;

    if (offScreen > 0) {
      jQuery('.measurements').addClass('flipped');
    }
    else if (jQuery('.flipped')) {
      jQuery('.flipped').removeClass('flipped');
    }

    if (jQuery('.full-opacity').length === 0) {
        jQuery('.measurements').addClass('full-opacity');
    }
}

function onMouseMove( event ) {
  if (playing && currentRenderStyle === "nodes") {
  	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      if (highlightSphere.visible && !pointLocked) {
          repositionMeasurements(event.clientX, event.clientY);
      }
      else if ( (jQuery('.full-opacity').length > 0) && !pointLocked ) {
          jQuery('.measurements').removeClass('full-opacity');
      }
    }
}

function createHighlightSphere(){
	highlightSphere = new THREE.Object3D();
	var geom = new THREE.SphereGeometry(40, 15, 15);
	var mat = new THREE.MeshPhongMaterial ({
		wireframe: true,
		color: pointColor,
		transparent: true,
		opacity: 0
	});
	var mesh = new THREE.Mesh(geom, mat);
  mesh.name="highlightSphere";
	highlightSphere.add(mesh);
  highlightSphere.name="highlightSphere";
	scene.add(highlightSphere);
}

function animateOpacity(object){
  object.opacity = jQuery('.measurements').css('opacity')*0.25;
}

function takeMeasurement(){
    raycaster.setFromCamera( mouse, camera );
    intersects = raycaster.intersectObjects( scene.children, true);
    highlightSphere.visible = (intersects.length <= 0 && !pointLocked) ? false : true;

    if (!pointLocked) {
      for ( var i = 0; i < intersects.length; i++ ) {
          if (intersects[i].object.name !== "highlightSphere") {
              if(intersects[i].object.material.wireframe === true){
                  intersectCoordinate(intersects[i].object);
                  tempPoint = intersects[i].object;
              }
          }
       }
    }
    else {
      intersectCoordinate(tempPoint);
    }

    highlightSphere.rotation.x+= 0.01;
    jQuery('.measurements .click-instructions').text(pointLocked ? unlockText : lockText);
    setMeasurements();
}

function intersectCoordinate(point){
	cloneVec.setFromMatrixPosition(point.matrixWorld);
  highlightSphere.position.set(cloneVec.x, cloneVec.y, cloneVec.z);
	pointColor = point.material.color;
	highlightSphere.children[0].material.color.set(pointColor);
  selectedPoint = nodeArray[point.parent.name];
}

function getAmplitude(distance) {
    inverseDistance = 1/distance;
    amplitudeAtCenter = waveValue * distFromEarth;
    return inverseDistance * amplitudeAtCenter;
}

function setMeasurements(){
    if (selectedPoint) {
        metersAway = pointLocked ? lockedPoint.bhVector[2] : selectedPoint.bhVector[2];
        jQuery('.measurements .distance .value').text((metersAway*10).toFixed(3));
        jQuery('.measurements .earth-force .value').html(formatStrain(waveValue));
        jQuery('.measurements .force .value').html(getAmplitude(metersAway).toFixed(3));
    }
}

function setPointLock(e) {
    console.log(pointLocked);
  if (playing) {
    if (e.target.localName = 'canvas') {
      if (pointLocked) {
          pointLocked = false;
          repositionMeasurements(e.clientX, e.clientY);
          highlightSphere.visible = false;
      }
      else if (intersects.length > 0 && !pointLocked) {
        pointLocked = true;
        lockedPoint = selectedPoint;
      }
    }
  }
};
