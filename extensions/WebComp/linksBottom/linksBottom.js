/**
 * @require JsMethod > cssListAnimationDelay
 */
(function (context) {
  'use strict';
   context.wjs.staticClassWebComp('linksBottom', {
    init: function () {
      this.wjs.cssListAnimationDelay(this.dom, 'ul li', '0.2,0.05');
    }
  });
}(wjsContext));