(function (loader) {
  'use strict';
  /**
   * Convert an object to array.
   */
  loader.methodAdd('objectToArray', function (object) {
    // Convert object to array.
    var i, output = [], keys = Object.keys(object);
    for (i = 0; i < keys.length; i++) {
      output.push(object[keys[i]]);
    }
    return output;
  });
}(loader));