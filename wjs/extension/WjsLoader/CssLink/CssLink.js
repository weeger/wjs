(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'CssLink', {
    processType: 'parse',

    /**
     * @require WjsLoader > JsMethod
     * @require JsMethod > cssLinkLoad
     */
    parse: function (name, value, process) {
      // Link have been included into page head.
      if (value === 'WJS_PUSH_CSSLINK_INCLUDED') {
        // Choose dom element with query selector.
        // Then continue parsing.
        return this.wjs.document.head.querySelector('link[href="' + name + '"]') || true;
      }
      var self = this;
      // Url can be sent from server as a key name
      // or from client as a url name.
      value = self.wjs.urlToken(value || name);
      if (!(value instanceof wjs.window.Error)) {
        self.wjs.cssLinkLoad(value, function (domLink) {
          // Append to head.
          self.enable(name, domLink);
          // Continue.
          self.parseLinkLoaded(name, domLink, process);
        });
        // Stop parsing.
        return false;
      }
    },

    enable: function (name, value) {
      if (!value.parentNode) {
        this.wjs.document.head.appendChild(value);
      }
    },

    disable: function (name, value) {
      // Parent node can be missing in case of
      // deletion of an unknown dom item.
      if (value.parentNode) {
        // Remove child from dom.
        value.parentNode.removeChild(value);
      }
    },

    parseLinkLoaded: function (name, domLink, process) {
      // Loading js file is enough, continue parsing.
      process.itemParseComplete(this.type, name, domLink);
    }
  });
}(WjsProto));
