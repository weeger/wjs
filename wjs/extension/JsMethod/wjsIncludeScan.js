(function (WjsProto) {
  'use strict';
  /**
   * Search for <wjs-include /> dom element recursively.
   * Inspect dom recursively but not into include tags.
   * Do not inspect inside each element found, a new
   * request should be launched separately.
   */
  WjsProto.register('JsMethod', 'wjsIncludeScan', function (dom) {
    var child, i = 0, output = [];
    while (child = dom.children[i++]) {
      if (child.tagName === 'WJS-INCLUDE') {
        output.push(child);
      }
      // Element is not a wjs include so we
      // search recursively into it.
      else {
        output = output.concat(this.wjsIncludeScan(child));
      }
    }
    return output;
  });
}(WjsProto));
