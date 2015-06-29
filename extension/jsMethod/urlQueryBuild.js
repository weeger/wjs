(function (WjsProto) {
  'use strict';
  /**
   * Convert a key / value object to a query string.
   */
  WjsProto.register('JsMethod', 'urlQueryBuild', function (object) {
    var output = [], i = 0, j, key, keys = Object.keys(object), keysParam;
    while (key = keys[i++]) {
      if (typeof object[key] === 'object') {
        keysParam = Object.keys(object[key]);
        for (j = 0; j < keysParam.length; j++) {
          output.push(key + '[' + keysParam[j] + ']' + '=' + object[key][keysParam[j]]);
        }
      }
      else {
        output.push(key + '=' + object[key]);
      }
    }
    return output.join('&');
  });
}(WjsProto));
