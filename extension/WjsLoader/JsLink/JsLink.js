(function (W) {
  'use strict';
  // <--]
  var cacheToken = '&c=' + Math.round(Math.random() * 1000000);
  W.register('WjsLoader', 'JsLink', {
    processType: 'parse',

    parse: function (name, value, process) {
      // Link have been included into page head.
      if (value === 'WJS5_PUSH_JSLINK_INCLUDED') {
        // Choose dom element with query selector.
        // It can also be missing in case of js aggregation.
        // Then continue parsing.
        return this.w.document.head.querySelector('script[src="' + name + '"]') || true;
      }
      var self = this, w = self.w,
        domScript = w.document.createElement('script');
      // Url can be sent from server as a key name
      // or from client as a url name.
      value = w.urlToken(value || name);
      if (!(value instanceof w.window.Error)) {
        w.onload(domScript, function () {
          // Continue.
          self.parseLinkLoaded(name, domScript, process);
        });
        // Append to head.
        self.enable(name, domScript);
        // Support flushing cached files.
        if (self.w.settings.cacheFlush) {
          if (value.indexOf('?') === -1) {
            value += '?';
          }
          value += cacheToken;
        }
        // We don't specify type as it is not required in HTML5.
        domScript.setAttribute('src', value);
        // Stop parsing.
        return false;
      }
      // Continue parsing.
      return true;
    },

    /**
     * @require JsMethod > isDomNode
     */
    enable: function (name, value) {
      if (value.nodeType && !value.parentNode) {
        this.w.document.head.appendChild(value);
      }
    },

    /**
     * @require JsMethod > isDomNode
     */
    disable: function (name, value) {
      // Dom node can be preprocessed
      // Parent node can be missing in case of
      // deletion of an unknown dom item.
      if (value.nodeType && value.parentNode) {
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
}(W));
