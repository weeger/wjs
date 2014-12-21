/**
 * Loader manage actions to do when requesting a new extension.
 * It is a collection of hooks called on requesting / parsing /
 * deleting extensions. It may use process to help it,
 * but keep in mind that processes can load and parse
 * multiple scripts in the same time.
 * @param {WjsProto} wjs
 */
(function (context) {
  'use strict';
  // <--]
  /** @constructor */
  context.wjs.classExtend('WjsLoader', {
    type: '',
    preventReload: true,
    processType: 'server',

    /**
     * Defines the base variables.
     * @private
     */
    __construct: function () {
      // Store links to processes, in order
      // to handle javascript cached responses.
      this.cacheHandler = {};
    },

    __destruct: function () {
      // To override...
    },

    /**
     * Called once on loader creation.
     */
    init: function () {
      // To override...
    },

    /**
     * Called after ajax call, ask loader
     * to parse his own extension.
     * @param extensionName
     * @param output
     * @param process
     * @returns {*}
     */
    parse: function (extensionName, output, process) {
      // To override...
      return output;
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
      // To override...
      return true;
    },

    /**
     * Launched on extension use request,
     * by default iterates over the names
     * of asked extensions.
     * @param {string} names
     * @param {WJSProcessProto} process
     */
    extRequestInit: function (names, process) {
      for (var i = 0; i < names.length; i++) {
        process.extRequestAdd({
          mode: this.processType,
          type: this.type,
          name: names[i]
        });
      }
    }
  });
  // [-->
}(window));
