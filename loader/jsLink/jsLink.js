(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('JsLink', {

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
          name: urls[i],
          data: urls[i]
        });
      }
      // Start process.
      process.loadingStart();
    },

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
}(typeof wjsContext !== 'undefined' ? wjsContext : window));
