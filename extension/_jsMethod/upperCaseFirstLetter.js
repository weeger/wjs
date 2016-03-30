(function (WjsProto) {
  'use strict';
  /**
   * Return first letter of a word in uppercase.
   */
  WjsProto.register('JsMethod', 'upperCaseFirstLetter', function (text) {
    return text.charAt(0).toUpperCase() + text.substr(1);
  });
}(WjsProto));
