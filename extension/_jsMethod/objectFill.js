(function (WjsProto) {
  'use strict';
  /**
   * @require JsMethod > isPlainObject
   */
  var objectFill = function (objectToFill, objectWith) {
    var i = 0, key, keys = Object.keys(objectWith);
    while (key = keys[i++]) {
      if (this.isPlainObject(objectWith[key])) {
        if (!objectToFill.hasOwnProperty(key)) {
          objectToFill[key] = Array.isArray(objectToFill[key]) ? [] : {};
        }
        objectFill.call(this, objectToFill[key], objectWith[key]);
      }
      else if (!objectToFill[key]) {
        objectToFill[key] = objectWith[key];
      }
    }
  };
  /**
   * Fill recursively an object with data from another one,
   * override only missing properties.
   */
  WjsProto.register('JsMethod', 'objectFill', function (objectToFill, objectWith) {
    objectFill.call(this, objectToFill, objectWith);
  });
}(WjsProto));
