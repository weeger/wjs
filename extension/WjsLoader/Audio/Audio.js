(function (W) {
  'use strict';
  W.register('WjsLoader', 'Audio', {
    processType: 'parse',
    /**
     * Use Audio loading to complete process.
     */
    parse: function (name, value, process) {
      // Create a new Audio object.
      var self = this, type = self.type,
        audio = new self.w.window.Audio(name);
      // Wait for load completed (no progressive playing)
      self.w.onload(audio, function () {
        // Allow inherited to place image somewhere.
        self.enable();
        // Continue.
        process.itemParseComplete(type, name, audio);
      });
      // Stop process.
      return false;
    }
  });
}(W));
