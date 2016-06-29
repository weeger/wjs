(function (W) {
  'use strict';
  /**
   * Execute a callback for each item of an object.
   * Callback can return null, in order to stop recursive inspection.
   */
  W.register('JsMethod', 'objectInspect', function (object, callback, args, level) {
    level = level || 0;
    if (typeof object === 'object') {
      var result = callback(object, args, level);
      // Recursive if not null.
      if (result !== null) {
        for (var keys = Object.keys(object), i = 0, key; key = keys[i++];) {
          // Continue if no false;
          if (this.objectInspect(object[key], callback, args, level + 1) === false) {
            return;
          }
        }
      }
      return result;
    }
  });
}(W));
