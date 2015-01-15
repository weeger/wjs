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
      return this.wjs.loaders.JsMethod.destroy.apply(this, [name, data, process]);
    },

    addJsClass: function (name, data) {
      this.addLastCompSave(name, data);
    },

    loadCompleteJsClass: function (name, process) {
      return this.loadCompleteJsMethod(name, process);
    }
  });
  // [-->
}(wjsContext));
