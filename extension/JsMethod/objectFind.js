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
    let base = object, item,
      // We use "arguments" variable to allow to defined false values.
      valueExists = (arguments.length === 4);
    path = path.split('.');
    while (path.length) {
      item = path.shift();
      if (base.hasOwnProperty(item)) {
        // We are on the last item.
        if (!path.length) {
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
      // We have a value to set.
      else if (valueExists) {
        // There is still a sub item in path,
        // but at this point, parent location is
        // already missing.
        if (path.length > 0) {
          // Create a parent container.
          base[item] = {};
          // Continue iteration.
          base = base[item];
        }
        // If we reach the last position
        // we put the defined value.
        else if (path.length === 0) {
          base[item] = value;
          return base[item];
        }
      }
  });
}(WjsProto));
