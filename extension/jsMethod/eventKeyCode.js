(function (loader) {
  'use strict';
  /**
   * Returns key code from an event.
   */
  loader.methodAdd('eventKeyCode', function (e) {
    // The property to obtain a key code depends on browsers you are using.
    return e.keyCode || e.which;
  });
}(loader));