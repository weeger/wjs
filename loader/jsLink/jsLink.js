(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('JsLink', {
    processType: 'parse',

    extDestroy: function (name, data) {
      // Remove child from dom.
      data.parentNode.removeChild(data);
    },

    parseJsLink: function (name, value, process) {
      var self = this,
        type = this.type,
        domScript = self.wjs.document.createElement('script');
      // Wait complete loading.
      domScript.onload = function () {
        process.parseItemComplete(type, name, domScript);
      };
      // We don't specify type as it is not required in HTML5.
      domScript.setAttribute('src', value);
      self.wjs.document.head.appendChild(domScript);
      return false;
    }
  });
  // [-->
}(wjsContext));
