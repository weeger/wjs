(function (loader) {
  'use strict';
  // <--]
  /**
   * Return length of own properties of a given object.
   * @param {Object} object
   * @return {number}
   */
  loader.methodAdd('objectLength', function (object) {
    var size = 0, key;
    for (key in object) {
      if (object.hasOwnProperty(key)) {
        size += 1;
      }
    }
    return size;
  });
  // [-->
}(loader));
