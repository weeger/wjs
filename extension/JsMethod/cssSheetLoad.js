(function (W) {
  'use strict';
  /**
   * Check if CSS Rules are correctly loaded before to execute
   * complete function. Use an interval to force process completion.
   * @require JsMethod > cssSheetRules
   */
  W.register('JsMethod', 'cssSheetLoad', function (domLink, complete, timeMax) {
    // One second max by default.
    timeMax = timeMax || 1000;
    var self = this, doc = self.document,
      checkInterval = 100, loaded = false, timeStart = (new Date()).getTime(),
      check = function () {
        if (!loaded) {
          var i = 0, item, styles = doc.styleSheets;
          // Iterates over items.
          while (item = styles[i++]) {
            // Find dom owner we are searching for.
            if (item.ownerNode === domLink && self.cssSheetRules(item)) {
              // Block further tests.
              loaded = true;
              // Complete.
              complete(domLink);
              return;
            }
          }
          // Time limit is not reached, test again.
          if ((new Date()).getTime() - timeStart < timeMax) {
            // Launch a new check.
            self.window.setTimeout(check, checkInterval);
          }
          // Force complete.
          else {
            // Block further tests.
            loaded = true;
            // Complete.
            complete(domLink);
          }
        }
      };
    // Launch timeout
    self.window.setTimeout(check, checkInterval);
    // First check.
    check();
  });
}(W));
