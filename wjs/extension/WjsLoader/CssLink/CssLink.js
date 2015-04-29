(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'CssLink', {
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
      if (value === 'WJS_PUSH_CSSLINK_INCLUDED') {
        // Choose dom element with query selector.
        // Then continue parsing.
        return this.wjs.document.head.querySelector('link[href="' + name + '"]') || true;
      }
      var self = this,
        domLink = self.wjs.document.createElement('link');
      // Url can be sent from server as a key name
      // or from client as a url name.
      value = self.wjs.urlToken(value || name);
      if (!(value instanceof wjs.window.Error)) {
        self.wjs.onload(domLink, function () {
          self.parseLinkLoaded(name, domLink, process);
        });
        // Set attributes.
        domLink.setAttribute('rel', 'stylesheet');
        domLink.setAttribute('href', value);
        self.wjs.document.head.appendChild(domLink);
        // Stop parsing.
        return false;
      }
    },

    parseLinkLoaded: function (name, domLink, process) {
      // Loading js file is enough, continue parsing.
      process.itemParseComplete(this.type, name, domLink);
    }
  });
  // [-->
}(WjsProto));
