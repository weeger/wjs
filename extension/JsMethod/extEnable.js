(function (W) {
  'use strict';
  /**
   * Enable extensions and all dependencies.
   * @require JsMethod > extHook
   */
  W.register('JsMethod', 'extEnable', function (type, name) {
    this.extHook(type, name, 'enable');
  });
}(W));
