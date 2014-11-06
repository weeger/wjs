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
      // onload event do not exists on firefox for link tags,
      // We use it instead, but we use a timeout in cas of
      // onload is not fired.
      domLink.onload = function () {
        process.parseItemComplete(type, name, domLink);
      };
      // Timeout, with a reasonable delay.
      self.wjs.window.setTimeout(function () {
        // If extension has not been loaded, a problem happens.
        // So we make it complete instead.
        if (!self.wjs.get(type, name)) {
          process.parseItemComplete(type, name, domLink);
        }
      }, 200);
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
