(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'WjsLoader', {
    // Extends full named loader class.
    loaderExtends: 'JsLink',
    processType: 'server',

    destroy: function (name, data) {
      var wjs = this.wjs, loaders = wjs.loaders;
      // Handle missing loaders.
      if (loaders[name]) {
        loaders[name].__destruct();
        // Remove prototype.
        wjs.classProtoDestroy('WjsLoader' + name);
        delete loaders[name];
        delete wjs.extLoaded[name];
        delete wjs.extRequire[name];
      }
      return loaders.JsLink.destroy.call(this, name, data);
    },

    parse: function (name, value, process) {
      var wjs = this.wjs;
      // If value is true, build loader
      // with the default prototype.
      if (value === true) {
        wjs.loaderAdd(name);
        return true;
      }
      else {
        // Listen for item registry.
        this.registerListen(this.type, name, process);
        // De not return JsScript return.
        wjs.loaders.JsLink.parse.call(this, name, value, process);
        // Block process in all cases.
        return false;
      }
    },

    parseLinkLoaded: function (name, domScript, process) {
      // Disable parent behavior on link load.
      // Complete is managed by register, not by onload event.
    },

    register: function (type, name, process) {
      var proto = WjsProto.retrieve(this.type, name);
      // Append loader for this wjs instance.
      this.wjs.loaderAdd(name, proto);
      // Continue parsing.
      process.itemParseComplete(this.type, name, proto);
    }
  });
  // [-->
}(WjsProto));
