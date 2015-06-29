/**
 * @require WjsLoader > JsScript
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'JsMethod', {
    loaderExtends: 'JsScript',
    addLastComp: null,
    addLastCompCallback: null,
    wjsShortcuts: true,

    __construct: function () {
      this.items = {};
      this.wjs.loaders.JsScript.__construct.call(this);
    },

    /**
     * Treat returned content as normal javascript.
     * Extra javascript is added from server side to
     * manage handling with add.
     * @param {string} name
     * @param {string} value
     * @param {WjsProto.lib.Process} process
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
      // Get method
      value = value || WjsProto.retrieve(this.type, name);
      // Localize functions to wjs.
      if (typeof value === 'function') {
        value = value.bind(this.wjs);
      }
      // Save method internally, loaders sub classes
      // may have already created entry.
      if (!this.items[name]) {
        this.items[name] = value;
      }
      // Activate.
      this.enable(name);
      // Continue parsing.
      // Allow child prototypes to force saved value.
      process.itemParseComplete(this.type, name, value);
    },

    destroy: function (name) {
      this.disable(name);
      return true;
    },

    enable: function (name) {
      // Add shortcut into wjs[name].
      if (this.wjsShortcuts === true && !this.wjs[name]) {
        this.wjs[name] = this.items[name];
      }
    },

    disable: function (name) {
      // Remove shortcut from wjs[name].
      if (this.wjsShortcuts === true && this.wjs[name]) {
        delete this.wjs[name];
      }
    }
  });
}(WjsProto));
