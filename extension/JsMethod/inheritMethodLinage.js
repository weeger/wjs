(function (W) {
  'use strict';
  /**
   * Create a super method for first function, pointing to
   * the second function with a __base() call.
   * @param base
   * @param add
   * @returns {}
   */
  W.register('JsMethod', 'inheritMethodLinage', function (object, baseMethod, addMethod, extraArgs) {
    // Base method is called with __base() function.
    return function () {
      var baseSaved = object.__base, result, args = arguments;
      object.__base = (typeof baseMethod === 'function') ? baseMethod : function () {
      };
      if (extraArgs) {
        // Convert arguments into an array.
        args = Array.prototype.slice.call(args).concat(extraArgs);
      }
      result = addMethod.apply(object, args);
      object.__base = baseSaved;
      return result;
    };
  });
}(W));
