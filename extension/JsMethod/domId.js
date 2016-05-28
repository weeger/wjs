(function (W) {
  'use strict';
  /**
   * Shortcut.
   */
  W.register('JsMethod', 'domId', function (id) {
    return this.window.document.getElementById(id);
  });
}(W));
