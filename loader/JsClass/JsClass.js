/**
 * @require JsMethod > localClass
 */
(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('JsClass', {
    // Extends full named loader class.
    classExtends: 'WjsLoaderJsScript',
    parse: function (name, data, process) {
      return this.wjs.loaders.JsScript.parse.apply(this, [name, data, process]);
    }
  });
  // [-->
}(wjsContext));
