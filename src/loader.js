/**
 * Loader manage actions to do when requesting a new extension.
 * It is a collection of hooks called on requesting / parsing /
 * deleting extensions. It may use process to help it, but keep
 * in mind that processes can load and parse multiple scripts
 * in the same time.
 * @param {WjsProto} wjs
 */
(function (WjsProto) {
  'use strict';
  // <--]
  // Save declaration statically into wjs proto.
  WjsProto.proto.Loader = {
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
      WjsProto.common[this.type] = WjsProto.common[this.type] || {};
    },

    __destruct: function () {
      // To override...
    },

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
     */
    register: function (type, name, process) {
      // To override...
    },

    /**
     * Called when a user click on a link
     * containing a wjs://type:name data link.
     */
    link: function (name) {
      // To override...
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

    enable: function (name, value, process) {
      // To override...
      return true;
    },

    disable: function (name, value) {
      // To override...
      return true;
    },

    /**
     * Launched on extension use request,
     * create data for process.
     * @param {string} name
     * @param {WjsProto.proto.Process} process
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
     * @param {WjsProto.proto.Process} process
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
