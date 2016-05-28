(function (W) {
  'use strict';
  /**
   * The property to obtain a key code depends on browsers you are using.
   * The following statement allows you to obtain a key code.
   */
  W.register('JsMethod', 'eventKeyCode', function (e) {
    return e.keyCode || e.which;
  });
}(W));
