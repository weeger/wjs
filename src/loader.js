/**
 * Loader manage actions to do when requesting a new extension.
 * It is a collection of hooks called on requesting / parsing /
 * deleting extensions. It may use process to help it, but keep
 * in mind that processes can load and parse multiple scripts
 * in the same time.
 */
(function (WjsProto) {
  'use strict';
  // <--]
  // Save declaration statically into wjs proto.
  WjsProto.lib.Loader = {
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
      WjsProto.reg.WjsLoader[this.type] = WjsProto.reg.WjsLoader[this.type] || {};
    },

    // To override...
    __destruct: WjsProto._e,

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
    register: WjsProto._e,

    /**
     * Called when a user click on a link
     * containing a wjs://type:name data link.
     */
    link: function (name) {
      // By default just load extension.
      this.wjs.use(this.type, name);
    },

    /**
     * Hook called by wjs on destroying extension.
     * @param {string} name
     * @param {?} data
     */
    destroy: function (name, data) {
      this.disable(name, data);
      return true;
    },

    // To override... (name, value, process)
    enable: WjsProto._e,

    // To override... (name, value)
    disable: WjsProto._e,

    /**
     * Launched on extension use request,
     * create data for process.
     * @param {string} name
     * @param {WjsProto.lib.Process} process
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
     * @param {WjsProto.lib.Process} process
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
      WjsProto.registerListen(type, name, function () {
        self.register.call(self, type, name, process);
      });
    }
  };
  // [-->
}(WjsProto));
