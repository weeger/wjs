/**
 * @require JsMethod > inheritProperty
 */
(function (WjsProto) {
  'use strict';
  /**
   * Merge variable from base to this instance type.
   * Non deep merge.
   * @param object
   * @param variable
   * @returns {{}}
   */
  WjsProto.register('JsMethod', 'inheritObject', function (object, variable) {
    var i = 0, output = {},
    // Get list of variable in different states levels.
      variables = this.inheritProperty(object, variable),
      keys = Object.keys(variables);
    // Merge variables.
    for (; i < keys.length; i++) {
      this.extendObject(output, variables[keys[i]], true);
    }
    return output;
  });
}(WjsProto));
