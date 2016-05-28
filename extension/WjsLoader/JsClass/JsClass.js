(function (W) {
  'use strict';
  W.register('WjsLoader', 'JsClass', {
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
      // Extend prototype.
      this.wjs.classExtend(name, W.retrieve(this.type, name));
      // Normal treatment.
      return this.wjs.loaders.JsMethod.register.apply(this, arguments);
    }
  });
}(W));
