(function (WjsProto) {
  'use strict';
  /**
   * Shortcut.
   */
  WjsProto.register('JsMethod', 'domId', function (id) {
    return this.window.document.getElementById(id);
  });
}(WjsProto));
