(function (W) {
  'use strict';
  /**
   * Return inner size of window,
   * with not scrollbar.
   */
  W.register('JsMethod', 'windowInnerSize', function () {
    var container = this.window,
      prefix = 'inner';
    if (!container.hasOwnProperty('innerWidth')) {
      prefix = 'client';
      container = this.document.documentElement || this.document.body;
    }
    return {
      width: container[prefix + 'Width'],
      height: container[prefix + 'Height']
    };
  });
}(W));
