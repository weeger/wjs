(function (loader) {
  'use strict';
  /**
   * Returns key code from an event.
   */
  loader.addJsMethod('eventKeyCode', function (e) {
    // The property to obtain a key code depends on browsers you are using.
    return e.keyCode || e.which;
  });
}(loader));