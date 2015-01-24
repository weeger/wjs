(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('JsMethod', {
    // Extends full named loader class.
    classExtends: 'WjsLoaderJsScript',
    addLastComp: null,
    addLastCompCallback: null,

    destroy: function (name, data) {
      if (this.wjs.hasOwnProperty(name)) {
        delete this.wjs[name];
      }
      return true;
    },

    /**
     * Treat returned content as normal javascript.
     * Extra javascript is added from server side to
     * manage handling with addJsMethod.
     * @param {string} name
     * @param {string} value
     * @param {WJSProcessProto} process
     * @return {?}
     */
    parse: function (name, value, process) {
      this.wjs.loaders.JsScript.parse.apply(this, [name, value, process]);
      // Return false stops parsing process.
      return false;
    },

    /**
     * Shortcut function to handle method declaration.
     * addJsMethod and addJsMethodComplete are called
     * in the same process.
     * @param {string} name
     * @param {Function} callback
     */
    addJsMethod: function (name, data) {
      this.addLastCompSave(name, data);
    },

    addLastCompSave: function (name, data) {
      this.addLastComp = name;
      this.addLastCompData = data;
    },

    /**
     * Execute callback to continue parsing,
     * call to this function is generated on server side,
     * and appended to the end of the script.
     * @param {string} name
     * @param {WJSProcessProto} process
     */
    loadCompleteJsMethod: function (name, process) {
      var self = this;
      if (self.addLastComp !== null) {
        if (!self.wjs.hasOwnProperty(name)) {
          self.wjs[name] = self.addLastCompData;
        }
        process.itemParseComplete(
          self.type,
          self.addLastComp,
          self.addLastCompData
        );
        // Reset temp variables.
        self.addLastComp =
          self.addLastCompData = null;
      }
    }
  });
  // [-->
}(wjsContext));
