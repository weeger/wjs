(function (W) {
  'use strict';
  // <--]
  W.register('WjsLoader', 'WjsLoader', {
    // Extends full named loader class.
    loaderExtends: 'JsLink',
    processType: 'server',

    destroy: function (name, data) {
      var w = this.w, loaders = w.loaders;
      // Handle missing loaders.
      if (loaders[name]) {
        loaders[name].__destruct();
        // Remove prototype.
        w.classProtoDestroy('WjsLoader' + name);
        delete loaders[name];
        delete w.extLoaded[name];
        delete w.extRequire[name];
      }
      return loaders.JsLink.destroy.call(this, name, data);
    },

    parse: function (name, value, process) {
      var w = this.w;
      // If value is true, build loader
      // with the default prototype.
      if (value === true) {
        w.loaderAdd(name);
        return true;
      }
      else {
        // Listen for item registry.
        this.registerListen(this.type, name, process);
        // De not return JsScript return.
        w.loaders.JsLink.parse.call(this, name, value, process);
        // Block process in all cases.
        return false;
      }
    },

    parseLinkLoaded: function (name, domScript, process) {
      // Disable parent behavior on link load.
      // Complete is managed by register, not by onload event.
    },

    register: function (type, name, process) {
      var proto = W.retrieve(this.type, name);
      // Append loader for this w instance.
      this.w.loaderAdd(name, proto);
      // Continue parsing.
      process.itemParseComplete(this.type, name, proto);
    }
  });
  // [-->
}(W));
