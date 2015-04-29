/**
 * Base class for WebComp elements.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicWebComp', {

    variables: {
      fadeOutClass: false,
      fadeInClass: false,
      fadeOutStarted: false,
      fadeOutComplete: false,
      classInit: false,
      classExit: false,
      classExitChildren: false,
      classExitChange: false
    },

    init: function () {
      // To override...
      return true;
    },

    exit: function () {
      this.webCompRemove();
      // To override...
      return true;
    },

    webCompRemove: function () {
      this.dom.parentNode.removeChild(this.dom);
    }
  });
}(WjsProto));
