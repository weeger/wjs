(function (W) {
  'use strict';
  W.register('WjsLoader', 'Image', {
    processType: 'parse',
    /**
     * Use Image loading to complete process.
     */
    parse: function (name, value, process) {
      // Create a new Image object.
      var self = this, type = self.type,
        image = new self.wjs.window.Image();
      // Wait for load completed.
      self.wjs.onload(image, function () {
        // Allow inherited to place image somewhere.
        self.enable();
        // Continue.
        process.itemParseComplete(type, name, image);
      });
      // This launch image load process.
      image.src = name;
      // Stop process.
      return false;
    }
  });
}(W));
