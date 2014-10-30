(function (wjs) {
  'use strict';
  // <--]
  wjs.loaderAdd('jsLink', {

    /**
     * Javascript are loaded via AJAX.
     */
    extLoad: function (urls, options) {
      // Init a new process.
      var i, urls = (!Array.isArray(urls)) ? [urls] : urls,
        length = urls.length,
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

    parseJsLink: function (name, value, process) {
      var self = this,
        type = this.type,
        domScript = self.wjs.document.createElement('script');
      // Wait complete loading.
      domScript.onload = function () {
        process.parseItemComplete(type, name, domScript);
      };
      // We don't specify type as it is not required in HTML5.
      domScript.setAttribute('src', name);
      self.wjs.document.head.appendChild(domScript);
      return false;
    }
  });
  // [-->
}(wjs));
