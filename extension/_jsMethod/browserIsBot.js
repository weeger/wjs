(function (WjsProto) {
  'use strict';
  /**
   * Return true if browser is detected as a
   * search engines robot.
   */
  WjsProto.register('JsMethod', 'browserIsBot', function () {
    return /bot|googlebot|crawler|spider|robot|crawling/i.test(this.window.navigator.userAgent);
  });
}(WjsProto));
