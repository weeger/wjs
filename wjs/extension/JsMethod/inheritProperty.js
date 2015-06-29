(function (WjsProto) {
  'use strict';
  /**
   * Get lineage of a specified property from an inherited object.
   * @param object
   * @param property
   * @returns {Array}
   */
  WjsProto.register('JsMethod', 'inheritProperty', function (object, property) {
    var base = object,
      output = [];
    // Use hasOwnProperty to define if we are out of
    // inherited objects.
    while (base !== null) {
      // Take only variable present in current prototype.
      if (base.hasOwnProperty(property)) {
        output.push(base[property]);
      }
      base = Object.getPrototypeOf(base);
    }
    return output.reverse();
  });
}(WjsProto));
