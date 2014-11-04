(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('WjsLoader', {
    // Extends full named loader class.
    classExtends: 'WjsLoaderJsLink',
    processType: 'server',

    extRequestInit: function () {
      // We use base extLoad, a single process to server.
      this.wjs.classMethods.WjsLoader.extRequestInit.apply(this, arguments);
    },

    extDestroy: function (name) {
      var wjs = this.wjs;
      // Remove prototype.
      wjs.classProtoDestroy('WjsLoader' + name);
      delete wjs.loaders[name];
      delete wjs.extLoaded[name];
      delete wjs.extRequire[name];
    },

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
        return this.parseJsLink(name, value, process);
      }
    }
  });
  // [-->
}(wjsContext));
