(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'JsClass', {
    loaderExtends: 'JsMethod',
    wjsShortcuts: false,

    destroy: function (name, data, process) {
      var wjs = this.wjs;
      // Remove prototype.
      wjs.classProtoDestroy(name);
      // Remove method.
      delete wjs.classMethods[name];
      // Remove JsMethod parts.
      return wjs.loaders.JsMethod.destroy.call(this, name, data, process);
    },

    register: function (type, name, process, value) {
      var self = this;
      self.wjs.classExtend(name, WjsProto.retrieve(self.type, name));
      return self.wjs.loaders.JsMethod.register.call(self, type, name, process, value);
    }
  });
  // [-->
}(WjsProto));
