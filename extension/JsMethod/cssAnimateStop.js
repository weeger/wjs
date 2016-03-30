(function (WjsProto) {
  'use strict';
  var iteration = function (dom) {
    this.trigger('cssAnimateStop', undefined, dom);
  };
  /**
   * @require JsMethod > domTreeMap
   */
  WjsProto.register('JsMethod', 'cssAnimateStop', function (dom) {
    // Shut down animations into
    this.domTreeMap(dom, iteration.bind(this));
  });
}(WjsProto));
