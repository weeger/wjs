(function (W) {
  'use strict';
  var iteration = function (dom) {
    this.trigger('cssAnimateStop', undefined, dom);
  };
  /**
   * @require JsMethod > domTreeMap
   */
  W.register('JsMethod', 'cssAnimateStop', function (dom) {
    // Shut down animations into
    this.domTreeMap(dom, iteration.bind(this));
  });
}(W));
