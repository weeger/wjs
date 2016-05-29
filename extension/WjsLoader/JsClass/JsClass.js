(function (W) {
  'use strict';
  W.register('WjsLoader', 'JsClass', {
    loaderExtends: 'JsMethod',
    wjsShortcuts: false,

    destroy: function (name, data, process) {
      var w = this.w;
      // Remove prototype.
      w.classProtoDestroy(name);
      // Remove method.
      delete w.classMethods[name];
      // Remove JsMethod parts.
      return w.loaders.JsMethod.destroy.call(this, name, data, process);
    },

    register: function (type, name, process, value) {
      // Extend prototype.
      this.w.classExtend(name, W.retrieve(this.type, name));
      // Normal treatment.
      return this.w.loaders.JsMethod.register.apply(this, arguments);
    }
  });
}(W));
