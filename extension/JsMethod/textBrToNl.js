(function (W) {
  'use strict';
  /**
   * http://stackoverflow.com/a/5959450/2057976
   */
  var regex = /<br\s*[\/]?>/gi;
  W.register('JsMethod', 'textBrToNl', function (str) {
    return str.replace(regex, "\n");
  });
}(W));
