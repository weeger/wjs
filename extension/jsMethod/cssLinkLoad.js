(function (WjsProto) {
  'use strict';
  /**
   * Advanced function for CSS links node load.
   * Check if CSS Rules are correctly loaded before to execute
   * complete function. Use an interval to force process completion.
   */
  WjsProto.register('JsMethod', 'cssLinkLoad', function (href, complete, timeMax) {
    timeMax = timeMax || 1000;
    var self = this, doc = self.document, domLink = doc.createElement('link'),
      checkInterval = 100, loaded = false, timeStart = (new Date).getTime(),
      check = function () {
        if (!loaded) {
          var i = 0, item, styles = doc.styleSheets;
          while (item = styles[i++]) {
            if (item.ownerNode === domLink && item.rules) {
              loaded = true;
              complete(domLink);
              return;
            }
          }
          if (((new Date).getTime()) - timeStart < timeMax) {
            // Launch a new check;
            self.window.setTimeout(check, checkInterval);
          }
          else {
            complete(domLink);
          }
        }
      };
    // Add classic listener.
    domLink.addEventListener('load', check);
    // Launch timeout
    self.window.setTimeout(check, checkInterval);
    // This argument is required to register link
    // into document.styleSheets list.
    domLink.setAttribute('rel', 'stylesheet');
    // We have to append node to head.
    doc.head.appendChild(domLink);
    // Launch loading.
    domLink.setAttribute('href', href);
  });
}(WjsProto));
