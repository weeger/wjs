(function (WjsProto) {
  'use strict';
  /**
   * Find data into an object using string path
   * like : "my.needle.name" into "haystack"
   * @param path
   * @param object object
   * @param {object} result Optional extra information about place who parameter was found.
   * @param {?} value Optional value to set.
   * @returns {*}
   */
  WjsProto.register('JsMethod', 'objectFind', function (path, object, result, value) {
    var base = object, item,
    // We use "arguments" variable to allow to defined false values.
      valueExists = (arguments.length === 4);
    path = path.split('.');
    while (path.length > 0) {
      item = path.shift();
      if (base.hasOwnProperty(item)) {
        // We are on the last item.
        if (path.length === 0) {
          if (result) {
            result.key = item;
            result.container = base;
          }
          if (valueExists) {
            base[item] = value;
          }
          return base[item];
        }
        base = base[item];
      }
      // If we reach the last position, but it is not filled,
      // we put the defined value, it let use this method
      // to add values on an empty object.
      else if (valueExists && path.length === 0) {
        base[item] = value;
        return base[item];
      }
    }
    // No value defined, and no value found.
    return false;
  });
}(WjsProto));
