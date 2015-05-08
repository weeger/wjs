(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'JsLink', {
    processType: 'parse',

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
        wjs.onload(domScript, function () {
          // Continue.
          self.parseLinkLoaded(name, domScript, process);
        });
        // Append to head.
        self.enable(name, domScript);
        // We don't specify type as it is not required in HTML5.
        domScript.setAttribute('src', value);
        // Stop parsing.
        return false;
      }
      // Continue parsing.
      return true;
    },

    enable: function (name, value) {
      this.wjs.document.head.appendChild(value);
    },

    disable: function (name, value) {
      // Parent node can be missing in case of
      // deletion of an unknown dom item.
      if (value.parentNode) {
        // Remove child from dom.
        value.parentNode.removeChild(value);
      }
    },

    parseLinkLoaded: function (name, domScript, process) {
      // Loading js file is enough, continue parsing.
      process.itemParseComplete(this.type, name, domScript);
    }
  });
  // [-->
}(WjsProto));
