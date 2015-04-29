(function (WjsProto) {
  'use strict';
  /**
   * Convert an object to array.
   */
  WjsProto.register('JsMethod', 'objectToArray', function (object) {
    // Convert object to array.
    var i, output = [], keys = Object.keys(object);
    for (i = 0; i < keys.length; i++) {
      output.push(object[keys[i]]);
    }
    return output;
  });
}(WjsProto));
