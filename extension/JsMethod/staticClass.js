(function (WjsProto) {
  'use strict';
  /**
   * Define class proto and create an instance
   * in the same time, useful for classes definition
   * created only once.
   */
  WjsProto.register('JsMethod', 'staticClass', function (name, proto, args) {
    this.classExtend(name, proto);
    return new (this.classProto(name))(args);
  });
}(WjsProto));
