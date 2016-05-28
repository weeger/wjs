(function (W) {
  'use strict';
  /**
   * Return true if browser is detected as a
   * search engines robot.
   */
  W.register('JsMethod', 'browserIsBot', function () {
    return /bot|googlebot|crawler|spider|robot|crawling/i.test(this.window.navigator.userAgent);
  });
}(W));
