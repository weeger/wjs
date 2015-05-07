(function (WjsProto) {
  'use strict';
  /**
   * Enable extensions and all dependencies.
   * @require JsMethod > extHook
   */
  WjsProto.register('JsMethod', 'extEnable', function (type, name) {
    this.extHook(type, name, 'enable');
  });
}(WjsProto));
