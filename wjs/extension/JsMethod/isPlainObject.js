(function (WjsProto) {
  'use strict';
  /**
   * Check to see if an object is a plain object
   * (created using "{}" or "new Object").
   * Forked from jQuery.
   * @param obj
   * @returns {boolean}
   */
  WjsProto.register('JsMethod', 'isPlainObject', function (obj) {
    // Not plain objects:
    // - Any object or value whose internal [[Class]] property is not "[object Object]"
    // - DOM nodes
    // - win dow
    if (obj === null || typeof obj !== "object" || obj.nodeType || (obj !== null && obj === obj.window)) {
      return false;
    }
    // Support: Firefox <20
    // The try/catch suppresses exceptions thrown when attempting to access
    // the "constructor" property of certain host objects, ie. |win dow.location|
    // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
    try {
      if (obj.constructor && !this.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
      }
    } catch (e) {
      return false;
    }
    // If the function hasn't returned already, we're confident that
    // |obj| is a plain object, created by {} or constructed with new Object
    return true;
  });
}(WjsProto));
