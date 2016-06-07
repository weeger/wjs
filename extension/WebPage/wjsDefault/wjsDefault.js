(function (W) {
  'use strict';
  // Class object of page.
  W.register('WebPage', 'wjsDefault', {
    init: function () {
      this.__super('init', arguments);
      // This is an example code.
      if (window.console && window.console.info) {
        window.console.info('Welcome to the default wjs web page.');
      }
    }
  });
}(W));
