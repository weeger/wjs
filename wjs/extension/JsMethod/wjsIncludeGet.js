(function (WjsProto) {
  'use strict';
  /**
   * Search for <wjs-include /> dom element recursively.
   * Do not inspect inside each element found, a new
   * request should be launched separately.
   */
  WjsProto.register('JsMethod', 'wjsIncludeGet', function (dom) {
    var child, i = 0, output = [];
    while (child = dom.children[i++]) {
      if (child.tagName === 'WJS-INCLUDE') {
        output.push(child);
      }
      else {
        output = output.concat(this.wjsIncludeGet(child));
      }
    }
    return output;
  });
}(WjsProto));
