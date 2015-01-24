/**
 * @require JsMethod > staticClass
 */
(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('JsClassStatic', {
    // Extends full named loader class.
    classExtends: 'WjsLoaderJsClass',
    parse: function (name, data, process) {
      var output = this.wjs.loaders.JsClass.parse.apply(this, [name, data, process]);
      return output;
    },

    addJsClassStatic: function (name, proto) {
      this.addLastCompSave(name, this.wjs.staticClass(name, proto));
    },

    loadCompleteJsClassStatic: function (name, process) {
      return this.loadCompleteJsClass(name, process);
    }
  });
  // [-->
}(wjsContext));
