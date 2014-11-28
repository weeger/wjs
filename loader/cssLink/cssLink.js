(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('CssLink', {
    processType: 'parse',

    destroy: function (name, data) {
      // Remove child from dom.
      data.parentNode.removeChild(data);
      return true;
    },

    parse: function (name, value, process) {
      var self = this,
        type = this.type,
        domLink = self.wjs.document.createElement('link'),
        loaded = false;
      self.wjs.onload(domLink, function () {
        process.parseItemComplete(type, name, domLink);
      });
      // Set attributes.
      domLink.setAttribute('rel', 'stylesheet');
      domLink.setAttribute('href', name);
      self.wjs.document.head.appendChild(domLink);
      // False stops parsing.
      return false;
    }
  });
  // [-->
}(wjsContext));
