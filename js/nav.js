var introPlayed = false;

jQuery(window).on('load', function(){
  init();
  if (!introPlayed) {}
    var loadTimer = setInterval(function(){
        if (jQuery('.loading').hasClass('done')) {
          introPlayed = true;
          clearInterval(loadTimer);
          setTimeout(function(){
            jQuery('.shroud, .nav-instructions').addClass('shown');
          },100);
        }
      },20);
});

function getRight(elem) {
  var left = jQuery(elem).position().left;
  console.log(left);
  var width =  jQuery(elem).width();
  console.log(width);
  var marginRight = parseFloat(jQuery(elem).css('margin-right'));
  console.log(marginRight);
  return left+width-marginRight;
}

function positionNextTo(panel, anchor) {
  var arrowIconWidth = 110;
  var horizOffset = getRight(anchor) + (jQuery(panel).width()/2) + arrowIconWidth;
  var vertOffset = (jQuery(anchor).offset().top) + (jQuery(panel).height()/2);
  console.log(anchor);
  jQuery(panel).css({'left':horizOffset,'top':vertOffset});
}

jQuery('.nav-instructions .next-button').on('mousedown', function(e) {
  var currentPanel = parseInt(jQuery(e.target).attr('class').split(' ')[1]);
  jQuery('.nav-instructions .panel#'+currentPanel).removeClass('panel-shown');
  jQuery('.nav-instructions .panel#'+(currentPanel+1)).addClass('panel-shown');

  if (jQuery('.panel-shown').hasClass('animation-controls')) {
    positionNextTo('.panel-shown', '.slider-container');
  }
  else if (jQuery('.panel-shown').hasClass('polarization-controls')) {
    positionNextTo('.panel-shown', '.polarization.plus');
  }
  else if (jQuery('.panel-shown').hasClass('transform-controls')) {
    positionNextTo('.panel-shown', '.transform.flat');
  }
  else if (jQuery('.panel-shown').hasClass('render-controls')) {
    positionNextTo('.panel-shown', '.render-style.mesh');
  }
});

function startVisualization() {
	jQuery('.nav-instructions').removeClass('shown');
    jQuery('.shroud').removeClass('shown');
     running = true;
    setTimeout(function(){
      loop();
    },500);
}

jQuery('.nav-instructions .start-button').on('mousedown', function() {
  startVisualization();
});

jQuery('.nav-instructions .skip-button').on('mousedown', function() {
  startVisualization();
});
