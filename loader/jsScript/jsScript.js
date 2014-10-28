(function (wjs) {
  'use strict';
  // <--]
  wjs.loaderAdd('jsScript', {
    /**
     * Execute retrieved javascript.
     * @param {string} name
     * @param {string} value
     * @param {WJSProcessProto} process
     * @return {?}
     */
    parseJsScript: function (name, value, process) {
      // If value is not a function, it came from
      // the not cached json response, so
      // we are forced to evaluate it.
      var isFunction = typeof value === 'function', loader = this;
      if (!isFunction) {
        // wjs, process and loader variables
        // can be used by scripts to register data.
        eval(value);
        return value;
      }
    }
  });
  // [-->
}(wjs));
