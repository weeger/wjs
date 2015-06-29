/**
 * Base class for WebCom option.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicWebComOption', {

    defaults: undefined,
    // Functions.
    define: null,
    destroy: null,

    __construct: function () {
      this.comList = {};
    },

    /**
     * Call super method of current object.
     * @require JsMethod > inheritMethod
     */
    __super: function (method, args) {
      return this.wjs.inheritMethod(this, method, args);
    },

    optionApply: function (com, value, options) {
      // Apply each option only once.
      // Useful when managing options dependencies.
      if (com.optionsApplied[this.name]) {
        return;
      }
      com.optionsApplied[this.name] = true;
      this.comList[com.id] = true;
      // Consider empty values like "" or null as real values.
      value = (value !== undefined) ? value : this.defaults;
      // Execute define callback.
      if (this.define) {
        value = this.define(com, value, options);
      }
      // Set value as object's variable.
      if (value !== undefined) {
        // Only define variable if it has not already been
        // defined into the object prototype, so we create
        // only useful local variables.
        if (com[this.name] === undefined) {
          // Each valid option defines a standard variable.
          com.variableInit(this.name, value);
        }
        // Define already initialised value.
        else {
          log(this.name);
          com.variableSet(this.name, value);
        }
      }
    },

    optionDestroy: function (com) {
      if (this.destroy) {
        this.destroy(com);
      }
      delete this.comList[com.id];
      return true;
    }
  });
}(WjsProto));
