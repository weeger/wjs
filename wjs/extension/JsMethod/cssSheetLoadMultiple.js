(function (WjsProto) {
  'use strict';
  WjsProto.register('JsMethod', 'cssSheetLoadMultiple', function (domLink, complete, timeMax) {
    timeMax = timeMax || 1000;
    var self = this, doc = self.document,
      checkInterval = 100, loaded = false, timeStart = (new Date()).getTime(),
      check = function () {
        if (!loaded) {
          var i = 0, item, styles = doc.styleSheets;
          while (item = styles[i++]) {
            if (item.ownerNode === domLink && self.cssSheetRules(item)) {
              loaded = true;
              complete(domLink);
              return;
            }
          }
          if ((new Date()).getTime() - timeStart < timeMax) {
            // Launch a new check;
            self.window.setTimeout(check, checkInterval);
          }
          else {
            loaded = true;
            complete(domLink);
          }
        }
      };
    // Launch timeout
    self.window.setTimeout(check, checkInterval);
    // First check.
    check();
  });
}(WjsProto));
