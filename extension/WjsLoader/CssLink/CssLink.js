(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'CssLink', {
    processType: 'parse',

    /**
     * @require WjsLoader > JsMethod
     * @require JsMethod > cssSheetLoad
     */
    parse: function (name, value, process) {
      // Link have been included into page head.
      if (value === 'WJS5_PUSH_CSSLINK_INCLUDED') {
        // Choose dom element with query selector.
        // Then continue parsing.
        return this.wjs.document.head.querySelector('link[href="' + name + '"]') || true;
      }
      var self = this,
        domLink = self.wjs.document.createElement('link');
      // Url can be sent from server as a key name
      // or from client as a url name.
      value = self.wjs.urlToken(value || name);
      if (!(value instanceof self.wjs.window.Error)) {
        self.wjs.onload(domLink, function () {
          // Wait for CSS rules to be loaded.
          self.wjs.cssSheetLoad(domLink, function (domLink) {
            // Continue.
            self.parseLinkLoaded(name, domLink, process);
          });
        });
        // This argument is required to register link
        // into document.styleSheets list.
        domLink.setAttribute('rel', 'stylesheet');
        // Append to head.
        self.enable(name, domLink);
        // Launch loading.
        domLink.setAttribute('href', value);
        // Stop parsing.
        return false;
      }
    },

    enable: function (name, value) {
      if (value.nodeType && !value.parentNode) {
        this.wjs.document.head.appendChild(value);
      }
    },

    disable: function (name, value) {
      // Parent node can be missing in case of
      // deletion of an unknown dom item.
      if (value.nodeType && value.parentNode) {
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
