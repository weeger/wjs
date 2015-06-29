(function (WjsProto) {
  'use strict';
  /**
   * Convert an object to array.
   */
  WjsProto.register('JsMethod', 'objectToArray', function (object) {
    // Convert object to array.
    for (var i = 0, key, output = [], keys = Object.keys(object); key = keys[i++];) {
      output.push(object[key]);
    }
    return output;
  });
}(WjsProto));
