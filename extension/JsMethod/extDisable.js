(function (W) {
  'use strict';
  /**
   * Disable extensions and all dependencies.
   * @require JsMethod > extHook
   */
  W.register('JsMethod', 'extDisable', function (type, name) {
    this.extHook(type, name, 'disable');
  });
}(W));
