(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('CssLink', {
    processType: 'parse',

    extDestroy: function (name, data) {
      // Remove child from dom.
      data.parentNode.removeChild(data);
    },

    parseCssLink: function (name, value, process) {
      var self = this,
        type = this.type,
        domLink = self.wjs.document.createElement('link');
      // Wait complete loading.
      domLink.onload = function () {
        process.parseItemComplete(type, name, domLink);
      };
      // We don't specify type as it is not required in HTML5.
      domLink.setAttribute('type', 'text/css');
      domLink.setAttribute('rel', 'stylesheet');
      domLink.setAttribute('href', name);
      self.wjs.document.head.appendChild(domLink);
      return false;
    }
  });
  // [-->
}(wjsContext));
