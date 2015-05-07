(function (WjsProto) {
  'use strict';
  /**
   * Disable extensions and all dependencies.
   * @require JsMethod > extHook
   */
  WjsProto.register('JsMethod', 'extDisable', function (type, name) {
    this.extHook(type, name, 'disable');
  });
}(WjsProto));
