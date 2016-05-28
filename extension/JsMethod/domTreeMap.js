(function (W) {
  'use strict';
  /**
   */
  W.register('JsMethod', 'domTreeMap', function (dom, callback) {
    callback(dom);
    if (dom.childNodes) {
      for (var domChild, i = 0; domChild = dom.childNodes[i++];) {
        this.domTreeMap(domChild, callback);
      }
    }
  });
}(W));
