(function (W) {
  'use strict';
  /**
   * Search for <div data-wjsInclude="..."> dom element recursively.
   * Inspect dom recursively but not into include tags.
   * Do not inspect inside each element found, a new
   * request should be launched separately.
   */
  W.register('JsMethod', 'wjsIncludeScan', function (dom) {
    var child, i = 0, output = [];
    while (child = dom.children[i++]) {
      if (child.getAttribute('data-wjsInclude')) {
        output.push(child);
      }
      // Element is not a w include so we
      // search recursively into it.
      else {
        output = output.concat(this.wjsIncludeScan(child));
      }
    }
    return output;
  });
}(W));
