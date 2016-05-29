(function (W) {
  'use strict';
  // Class object of page.
  W.register('WebPage', 'wjsDefault', {
    initWebPage:function() {
      // This is an example code.
      if (window.console && window.console.info) {
        window.console.info('Welcome to the default w web page.');
      }
    }
  });
}(W));
