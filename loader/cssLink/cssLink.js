(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('cssLink', {

    /**
     * Javascript are loaded via AJAX.
     */
    extLoad: function (urls, options) {
      urls = (!Array.isArray(urls)) ? [urls] : urls;
      // Init a new process.
      var i, length = urls.length,
        process = new this.wjs.processProto({
          async: options.async,
          complete: options.complete,
          mainType: this.type,
          mainName: urls[0]
        });
      // Append all items as a request.
      for (i = 0; i < urls.length; i++) {
        process.extRequestAdd({
          mode: 'parse',
          type: this.type,
          name: urls[i]
        });
      }
      // Start process.
      process.loadingStart();
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
}(typeof wjsContext !== 'undefined' ? wjsContext : window));
