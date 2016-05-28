/**
 * @require JsMethod > inheritProperty
 */
(function (W) {
  'use strict';
  /**
   * Merge variable from base to this instance type.
   * Non deep merge.
   * @param object
   * @param variable
   * @returns {{}}
   */
  W.register('JsMethod', 'inheritObject', function (object, variable) {
    var i = 0, key, output = {},
    // Get list of variable in different states levels.
      variables = this.inheritProperty(object, variable),
      keys = Object.keys(variables);
    // Merge variables.
    while (key = keys[i++]) {
      this.extendObject(output, variables[key], true);
    }
    return output;
  });
}(W));
