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
      if (this.wjsShortcuts && this.wjs[name]) {
        delete this.wjs[name];
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
      var wjs = this.wjs;
      // Add shortcut into wjs[name].
      if (this.wjsShortcuts === true && !wjs[name]) {
        wjs[name] = (WjsProto.retrieve(this.type, name)).bind(wjs);
      }
      // Continue parsing.
      // Allow child prototypes to force saved value.
      process.itemParseComplete(this.type, name, value || WjsProto.retrieve(this.type, name));
    }
  });
  // [-->
}(WjsProto));
