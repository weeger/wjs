(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('Image', {
    processType: 'parse',

    /**
     * Use Image loading to complete process.
     * @param {string} name
     * @param {string} value
     * @param {WJSProcessProto} process
     * @return {?}
     */
    parse: function (name, value, process) {
      // Create a new object.
      var self = this,
        image = new self.wjs.window.Image(),
        type = self.type,
        loaded = true;
      self.wjs.onload(image, function () {
        process.parseItemComplete(type, name, image);
      });
      // This launch image load process.
      image.src = name;
      // Return false stops parsing process,
      // And let us handle when we want to
      // continue parsing (after image loading).
      return false;
    }
  });
  // [-->
}(wjsContext));
