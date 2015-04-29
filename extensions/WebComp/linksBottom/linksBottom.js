/**
 * @require JsMethod > cssListAnimationDelay
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WebComp', 'linksBottom', {
    init: function () {
      this.wjs.cssListAnimationDelay(this.dom, 'ul li', '0.2,0.05');
    }
  });
}(WjsProto));
