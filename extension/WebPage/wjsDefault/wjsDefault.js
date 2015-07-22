(function (WjsProto) {
  'use strict';
  // Class object of page.
  WjsProto.register('WebPage', 'wjsDefault', {
    initWebPage:function() {
      // This is an example code.
      if (window.console && window.console.info) {
        window.console.info('Welcome to the default wjs web page.');
      }
    }
  });
}(WjsProto));
