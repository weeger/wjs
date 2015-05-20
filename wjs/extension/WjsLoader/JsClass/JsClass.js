(function (WjsProto) {
  'use strict';
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
      this.wjs.classExtend(name, WjsProto.retrieve(this.type, name));
      return this.wjs.loaders.JsMethod.register.call(this, type, name, process, value);
    }
  });
}(WjsProto));
