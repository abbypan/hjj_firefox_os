$(document).bind("mobileinit", function() 
{ 
   if (navigator.userAgent.indexOf("Android") != -1) 
   { 
     $.mobile.defaultPageTransition = 'none'; 
     $.mobile.defaultDialogTransition = 'none'; 
     $.mobile.buttonMarkup.hoverDelay = 0;
   } 

    //$.event.special.tap.tapholdThreshold = 10;
    //$.event.special.swipe.horizontalDistanceThreshold = 3;
    //$.event.special.swipe.verticalDistanceThreshold = 1000;
    //$.event.special.swipe.durationThreshold = 4000;
    //$.event.special.swipe.scrollSupressionThreshold = 1;
});
