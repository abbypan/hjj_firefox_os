
$(document).on("mobileinit", function() 
{ 
$.mobile.allowCrossDomainPages = true;
$.mobile.buttonMarkup.hoverDelay = 0;
$.mobile.defaultDialogTransition = 'none'; 
$.mobile.defaultPageTransition = 'none';
$.mobile.phonegapNavigationEnabled = true;
$.mobile.zoom.enabled = false;

$.support.cors = true;  
//$.mobile.ajaxEnabled = true;
//$.mobile.hashListeningEnabled = true;

//$.event.special.swipe.durationThreshold = 4000;
//$.event.special.swipe.horizontalDistanceThreshold = 3;
//$.event.special.swipe.scrollSupressionThreshold = 1;
//$.event.special.swipe.verticalDistanceThreshold = 1000;
$.event.special.tap.tapholdThreshold = 10;
$.event.special.swipe.durationThreshold = 500; 
$.event.special.swipe.horizontalDistanceThreshold = 30;
$.event.special.swipe.scrollSupressionThreshold = 10; 
$.event.special.swipe.verticalDistanceThreshold = 75;

});

