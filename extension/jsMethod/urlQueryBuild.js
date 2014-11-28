(function (loader) {
  'use strict';
  /**
   * Convert a key / value object to a query string.
   */
  loader.methodAdd('urlQueryBuild', function (object) {
    var output = [], i = 0, j, keys = Object.keys(object), keysParam;
    for (; i < keys.length; i++) {
      if (typeof object[keys[i]] === 'object') {
        keysParam = Object.keys(object[keys[i]]);
        for (j = 0; j < keysParam.length; j++) {
          output.push(keys[i] + '[' + keysParam[j] + ']' + '=' + object[keys[i]][keysParam[j]]);
        }
      }
      else {
        output.push(keys[i] + '=' + object[keys[i]]);
      }
    }

    return output.join('&');
  });
}(loader));