(function (W) {
  'use strict';
  /**
   * Return first letter of a word in uppercase.
   */
  W.register('JsMethod', 'upperCaseFirstLetter', function (text) {
    return text.charAt(0).toUpperCase() + text.substr(1);
  });
}(W));
