(function (W) {
  'use strict';
  /**
   * Thanks to http://stackoverflow.com/a/5624139/2057976
   */
  var componentToHex = function (c) {
    c = c.toString(16);
    return c.length === 1 ? '0' + c : c;
  };
  var reg = /(rgba?)|(\d+(\.\d+)?%?)|(\.\d+)/g;
  W.register('JsMethod', 'colorRgbToHex', function (r, g, b) {
    // Support rgb(XX,XX,XX) string at first argument.
    if (g === undefined) {
      r = r.match(reg);
      b = parseInt(r[3]);
      g = parseInt(r[2]);
      r = parseInt(r[1]);
    }
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  });
}(W));
