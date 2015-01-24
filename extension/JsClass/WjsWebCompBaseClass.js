/**
 * Base class for WebComp elements.
 */
(function (loader) {
  'use strict';
  var wjs = loader.wjs;
  loader.addJsClass('WjsWebCompBaseClass', {
    init: function () {
      // To override...
      return true;
    },
    exit: function () {
      // To override...
      return true;
    },
    webCompRemove: function () {
      this.dom.parentNode.removeChild(this.dom);
    }
  });
  // [-->
}(loader));