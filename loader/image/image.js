(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('Image', {

    /**
     * We need a special process with no ajax request,
     * just simple parsing.
     * @param {string} name
     * @param {Object} options
     */
    extLoad: function (name, options) {
      this.processSingle(options, {
        mode: 'parse',
        name: name
      });
    },

    /**
     * Use Image loading to complete process.
     * @param {string} name
     * @param {string} value
     * @param {WJSProcessProto} process
     * @return {?}
     */
    parseImage: function (name, value, process) {
      // Create a new object.
      var image = new this.wjs.window.Image(),
        type = this.type;
      // Callback method when loading is complete.
      image.onload = function () {
        process.parseItemComplete(type, name, image);
      };
      // This launch image load process.
      image.src = name;
      // Return false stops parsing process,
      // And let us handle when we want to
      // continue parsing (after image loading).
      return false;
    }
  });
  // [-->
}(typeof wjsContext !== 'undefined' ? wjsContext : window));
