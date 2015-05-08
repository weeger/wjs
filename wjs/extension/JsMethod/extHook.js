(function (WjsProto) {
  'use strict';
  WjsProto.register('JsMethod', 'extHook', function (type, name, action) {
    var self = this;
    this.regEach(this.extRequire[type][name], function (type, name) {
      self.loaders[type][action](name, self.get(type, name));
    });
    self.loaders[type][action](name, self.get(type, name));
  });
}(WjsProto));
