/**
 * @require JsMethod > inheritProperty
 * @require JsMethod > inheritMethodLinage
 * @require JsMethod > isPlainObject
 */
(function (W) {
  'use strict';
  /**
   * Inspect package tree to merge content.
   * @param {object} object
   * @param {object} result
   * @param {object} add
   * @private
   */
  function _inheritLinage(object, result, add) {
    var i;
    for (i in add) {
      if (add.hasOwnProperty(i)) {
        if (typeof add[i] === 'function') {
          // We don't use inheritMethod, we already got list of
          // inherited property into the main inheritLinage method.
          result[i] = this.inheritMethodLinage(object, result[i], add[i]);
        }
        // Escape some objects to avoid recursions.
        else if (this.isPlainObject(add[i])) {
          if (!result.hasOwnProperty(i)) {
            result[i] = {};
          }
          // Continue to search for other functions.
          _inheritLinage.call(this, object, result[i], add[i]);
        }
        else if (Array.isArray(add[i])) {
          result[i] = [];
          this.extendObject(result[i], add[i]);
        }
        else {
          result[i] = add[i];
        }
      }
    }
  }

  /**
   * Merge variable from base to current instance type.
   * Create inheritance for functions.
   *
   * @param {object} object
   * @param {string} name
   */
  W.register('JsMethod', 'inheritLinage', function (object, name) {
    var variables = this.inheritProperty(object, name),
      item, i = 0;
    // Reset package.
    object[name] = {};
    // Merge inherited packages.
    while (item = variables[i++]) {
      // Create base constructor for functions.
      _inheritLinage.call(this, object, object[name], item);
    }
  });
}(W));
