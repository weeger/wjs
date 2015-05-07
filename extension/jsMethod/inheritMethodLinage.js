(function (WjsProto) {
  'use strict';
  /**
   * Create a super method for first function, pointing to
   * the second function with a __base() call.
   * @param base
   * @param add
   * @returns {}
   */
  WjsProto.register('JsMethod', 'inheritMethodLinage', function (object, baseMethod, addMethod) {
    // Base method is called with __base() function.
    return function () {
      var baseSaved = object.__base,
        result;
      object.__base = (typeof baseMethod === 'function') ? baseMethod : function () {
      };
      result = addMethod.apply(object, arguments);
      object.__base = baseSaved;
      return result;
    };
  });
}(WjsProto));
