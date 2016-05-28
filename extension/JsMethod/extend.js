(function (W) {
  'use strict';
  /**
   * This is a quasi clone of jQuery's extend() function.
   * @require JsMethod > isDomNode
   * @require JsMethod > isPlainObject
   * @returns {*|{}}
   */
  W.register('JsMethod', 'extend', function (e) {
    // Make a copy of arguments to avoid JS inspector hints.
    var toAdd, name, copyIsArray, clone,
    // The target object who receive parameters
    // form other objects.
      target = arguments[0] || {},
    // Index of first argument to mix to target.
      i = 1,
    // Mix target with all function arguments.
      length = arguments.length,
    // Define if we merge object recursively.
      deep = false;

    // Handle a deep copy situation.
    if (typeof target === 'boolean') {
      deep = target;
      // Skip the boolean and the target.
      target = arguments[ i ] || {};
      // Use next object as first added.
      i += 1;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && typeof target !== 'function') {
      target = {};
    }

    // Loop trough arguments.
    for (false; i < length; i += 1) {
      // Only deal with non-null/undefined values
      if ((toAdd = arguments[ i ]) !== null) {
        // Extend the base object.
        for (name in toAdd) {
          // We do not wrap for loop into hasOwnProperty,
          // to access to all values of object.
          // Prevent never-ending loop.
          if (target === toAdd[name]) {
            continue;
          }
          // Recurse if we're merging plain objects or arrays.
          if (deep && toAdd[name] && (this.isPlainObject(toAdd[name]) || (copyIsArray = Array.isArray(toAdd[name])))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = target[name] && Array.isArray(target[name]) ? target[name] : [];
            }
            else {
              clone = target[name] && this.isPlainObject(target[name]) ? target[name] : {};
            }
            // Never move original objects, clone them.
            target[name] = this.extend(deep, clone, toAdd[name]);
          }
          // Don't bring in undefined values.
          else if (toAdd[name] !== undefined) {
            target[name] = toAdd[name];
          }
        }
      }
    }
    return target;
  });
}(W));
