/**
 * @require WjsLoader > JsScript
 */
(function (W) {
  'use strict';
  W.register('WjsLoader', 'JsMethod', {
    loaderExtends: 'JsScript',
    addLastComp: null,
    addLastCompCallback: null,
    wjsShortcuts: true,

    __construct: function () {
      this.items = {};
      this.w.loaders.JsScript.__construct.call(this);
    },

    /**
     * Treat returned content as normal javascript.
     * Extra javascript is added from server side to
     * manage handling with add.
     * @param {string} name
     * @param {string} value
     * @param {W.lib.Process} process
     * @return {?}
     */
    parse: function (name, value, process) {
      // Start listening for method registering
      this.registerListen(this.type, name, process, value);
      // Parse as a normal script.
      this.w.loaders.JsScript.parse.call(this, name, value, process);
      // Return false stops parsing process.
      return false;
    },

    register: function (type, name, process, value) {
      // Get method
      value = value || W.retrieve(this.type, name);
      // Localize functions to w.
      if (typeof value === 'function') {
        value = value.bind(this.w);
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
      // Add shortcut into w[name].
      if (this.wjsShortcuts === true && !this.w[name]) {
        this.w[name] = this.items[name];
      }
    },

    disable: function (name) {
      // Remove shortcut from w[name].
      if (this.wjsShortcuts === true && this.w[name]) {
        delete this.w[name];
      }
    }
  });
}(W));
