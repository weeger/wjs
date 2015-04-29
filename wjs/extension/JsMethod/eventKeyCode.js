(function (WjsProto) {
  'use strict';
  /**
   * Returns key code from an event.
   */
  WjsProto.register('JsMethod', 'eventKeyCode', function (e) {
    // The property to obtain a key code depends on browsers you are using.
    return e.keyCode || e.which;
  });
}(WjsProto));
