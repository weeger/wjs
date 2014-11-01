(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('jsMethod', {
    // Extends full named loader class.
    classExtends: 'WjsLoaderJsScript',
    methodAddLast: null,
    methodAddLastCallback: null,

    /**
     * Treat returned content as normal javascript.
     * Extra javascript is added from server side to
     * manage handling with methodAdd.
     * @param {string} name
     * @param {string} value
     * @param {WJSProcessProto} process
     * @return {?}
     */
    parseJsMethod: function (name, value, process) {
      this.parseJsScript(name, value, process);
      // Return false stops parsing process.
      return false;
    },

    /**
     * Shortcut function to handle method declaration.
     * methodAdd and methodAddComplete are called
     * in the same process.
     * @param {string} name
     * @param {Function} callback
     */
    methodAdd: function (name, callback) {
      this.methodAddLast = name;
      this.methodAddLastCallback = callback;
    },

    /**
     * Execute callback to continue parsing,
     * call to this function is generated on server side,
     * and appended to the end of the script.
     * @param {string} name
     * @param {WJSProcessProto} process
     */
    methodAddedComplete: function (name, process) {
      process.parseItemComplete(
        this.type,
        this.methodAddLast,
        this.methodAddLastCallback
      );
    }
  });
  // [-->
}(typeof wjsContext !== 'undefined' ? wjsContext : window));
