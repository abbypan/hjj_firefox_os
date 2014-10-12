$(document).bind("mobileinit", function() 
{ 
    $.mobile.allowCrossDomainPages = true;
    $.mobile.phonegapNavigationEnabled = true;
    //$.mobile.ajaxEnabled = true;
    //$.mobile.hashListeningEnabled = true;
    $.mobile.buttonMarkup.hoverDelay = "false";
    $.mobile.defaultPageTransition = 'none';
    $.mobile.buttonMarkup.hoverDelay = "false";
    
   if (navigator.userAgent.indexOf("Android") != -1) 
   { 
     $.mobile.defaultPageTransition = 'none'; 
     $.mobile.defaultDialogTransition = 'none'; 
     //$.mobile.buttonMarkup.hoverDelay = 0;
   } 

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
