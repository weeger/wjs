(function (W) {
  'use strict';
  W.register('WjsLoader', 'JsScript', {
    /**
     * Execute retrieved javascript.
     * @param {string} name
     * @param {string|Function} value
     * @param {W.lib.Process} process
     * @return {?}
     */
    parse: function (name, value, process) {
      // If value is not a function, it came from
      // the not cached json response, so
      // we are forced to evaluate it.
      if (typeof value !== 'function') {
        // w, process and loader variables
        // can be used by scripts to register data.
        // We have to add local vars here, this allow to give
        // references to these vars into parsed script,
        // also after w script compression, who rename local vars.
        eval(value);
      }
      else {
        value(this, name, process);
      }
      return value;
    }
  });
}(W));
