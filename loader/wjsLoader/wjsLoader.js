(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('wjsLoader', {
    // Extends full named loader class.
    classExtends: 'WjsLoaderJsScript',
    // Loader is created by javascript.
    parseWjsLoader: function (name, value, process) {
      // If value is true,
      // Build loader with the default prototype,
      // no special action is defined for loading or parsing
      // retrieved content.
      if (value === true) {
        this.wjs.loaderAdd(name);
      }
      else {
        return this.parseJsScript(name, value, process);
      }
    }
  });
  // [-->
}(typeof wjsContext !== 'undefined' ? wjsContext : window));
