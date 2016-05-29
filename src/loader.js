/**
 * Loader manage actions to do when requesting a new extension.
 * It is a collection of hooks called on requesting / parsing /
 * deleting extensions. It may use process to help it, but keep
 * in mind that processes can load and parse multiple scripts
 * in the same time.
 */
(function (W) {
  'use strict';
  // <--]
  // Save declaration statically into w proto.
  W.lib.Loader = {
    type: '',
    preventReload: true,
    processType: 'server',

    /**
     * Defines the base variables.
     * @private
     */
    __construct: function () {
      // Create default entry into static variables,
      // loader may add extra entry if needed, so
      // entry name is not deeply linked to loader name.
      // Entry can also be declared previously than loader.
      W.reg.WjsLoader[this.type] = W.reg.WjsLoader[this.type] || {};
    },

    // To override...
    __destruct: W._e,

    /**
     * Called after ajax call, ask loader
     * to parse his own extension.
     * @returns {*}
     */
    parse: function (name, value, process) {
      this.enable(name, value, process);
      return value;
    },

    /**
     * Fired when a listened element is registered
     * during parse. Should be initialised with listenRegister.
     * To override... (type, name, process)
     */
    register: W._e,

    /**
     * Called when a user click on a link
     * containing a w://type:name data link.
     */
    link: function (name) {
      // By default just load extension.
      this.w.use(this.type, name);
    },

    /**
     * Hook called by w on destroying extension.
     * @param {string} name
     * @param {?} data
     */
    destroy: function (name, data) {
      this.disable(name, data);
      return true;
    },

    // To override... (name, value, process)
    enable: W._e,

    // To override... (name, value)
    disable: W._e,

    /**
     * Launched on extension use request,
     * create data for process.
     * @param {string} name
     * @param {W.lib.Process} process
     */
    requestUse: function (name, process) {
      return {
        mode: this.processType,
        type: this.type,
        name: name
      };
    },

    /**
     * Launched on extension use request,
     * create data for process.
     * @param {string} name
     * @param {W.lib.Process} process
     */
    requestDestroy: function (name, process) {
      return {
        mode: 'parse',
        type: this.type,
        name: name
      };
    },

    registerListen: function (type, name, process) {
      var self = this;
      W.registerListen(type, name, function () {
        self.register.call(self, type, name, process);
      });
    }
  };
  // [-->
}(W));
