(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('JsClass', {
    // Extends full named loader class.
    classExtends: 'WjsLoaderJsMethod',
    parse: function (name, data, process) {
      return this.wjs.loaders.JsMethod.parse.apply(this, [name, data, process]);
    },

    destroy: function (name, data, process) {
      // Remove prototype.
      this.wjs.classProtoDestroy(name);
      // Remove method.
      delete this.wjs.classMethods[name];
      // Remove JsMethod parts.
      return this.wjs.loaders.JsMethod.destroy.apply(this, [name, data, process]);
    },

    addJsClass: function (name, data) {
      this.addLastCompSave(name, data);
    },

    loadCompleteJsClass: function (name, process) {
      this.wjs.classExtend(name, this.addLastCompData);
      return this.loadCompleteJsMethod(name, process);
    }
  });
  // [-->
}(wjsContext));
