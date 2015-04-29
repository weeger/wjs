(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'JsLink', {
    processType: 'parse',

    destroy: function (name, data) {
      // Parent node can be missing in case of
      // deletion of an unknown dom item.
      if (data.parentNode) {
        // Remove child from dom.
        data.parentNode.removeChild(data);
      }
      return true;
    },

    parse: function (name, value, process) {
      // Link have been included into page head.
      if (value === 'WJS_PUSH_JSLINK_INCLUDED') {
        // Choose dom element with query selector.
        // It can also be missing in case of js aggregation.
        // Then continue parsing.
        return this.wjs.document.head.querySelector('script[src="' + name + '"]') || true;
      }
      var self = this, wjs = self.wjs,
        domScript = wjs.document.createElement('script');
      // Url can be sent from server as a key name
      // or from client as a url name.
      value = wjs.urlToken(value || name);
      if (!(value instanceof wjs.window.Error)) {
        self.wjs.onload(domScript, function () {
          self.parseLinkLoaded(name, domScript, process);
        });
        // We don't specify type as it is not required in HTML5.
        domScript.setAttribute('src', value);
        wjs.document.head.appendChild(domScript);
        // Stop parsing.
        return false;
      }
      // Continue parsing.
      return true;
    },

    parseLinkLoaded: function (name, domScript, process) {
      // Loading js file is enough, continue parsing.
      process.itemParseComplete(this.type, name, domScript);
    }
  });
  // [-->
}(WjsProto));
