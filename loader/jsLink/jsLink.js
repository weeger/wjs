(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('JsLink', {
    processType: 'parse',

    destroy: function (name, data) {
      // Remove child from dom.
      data.parentNode.removeChild(data);
      return true;
    },

    parse: function (name, value, process) {
      var self = this,
        type = this.type,
        domScript = self.wjs.document.createElement('script');
      // Url can be sent from server as a key name
      // or from client as a url name.
      value = value || name;
      if (!(value instanceof self.wjs.window.Error)) {
        self.wjs.onload(domScript, function () {
          process.itemParseComplete(type, name, domScript);
        });
        // We don't specify type as it is not required in HTML5.
        domScript.setAttribute('src', value);
        self.wjs.document.head.appendChild(domScript);
        return false;
      }
    }
  }, true);
  // [-->
}(wjsContext));
