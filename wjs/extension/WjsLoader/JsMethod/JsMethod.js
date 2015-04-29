/**
 * @require WjsLoader > JsScript
 */
(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'JsMethod', {
    loaderExtends: 'JsScript',
    addLastComp: null,
    addLastCompCallback: null,
    wjsShortcuts: true,

    destroy: function (name) {
      var self = this;
      if (self.wjsShortcuts && self.wjs.hasOwnProperty(name)) {
        delete self.wjs[name];
      }
      return true;
    },

    /**
     * Treat returned content as normal javascript.
     * Extra javascript is added from server side to
     * manage handling with add.
     * @param {string} name
     * @param {string} value
     * @param {WjsProto.proto.Process} process
     * @return {?}
     */
    parse: function (name, value, process) {
      // Start listening for method registering
      this.registerListen(this.type, name, process, value);
      // Parse as a normal script.
      this.wjs.loaders.JsScript.parse.call(this, name, value, process);
      // Return false stops parsing process.
      return false;
    },

    register: function (type, name, process, value) {
      var self = this;
      // Add shortcut into wjs[name].
      if (self.wjsShortcuts === true && !self.wjs.hasOwnProperty(name)) {
        self.wjs[name] = (WjsProto.retrieve(this.type, name)).bind(self.wjs);
      }
      // Continue parsing.
      // Allow child prototypes to force saved value.
      process.itemParseComplete(this.type, name, value || WjsProto.retrieve(this.type, name));
    }
  });
  // [-->
}(WjsProto));
