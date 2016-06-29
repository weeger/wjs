(function (W) {
  'use strict';
  /**
   * @require WjsLibrary > WebFontLoader
   */
  W.register('WjsLoader', 'Font', {
    parse: function (name, value, process) {
      var self = this, complete = function () {
        // Loading js file is enough, continue parsing.
        process.itemParseComplete(self.type, name, true);
      };
      WebFont.load({
        google: {
          families: [name]
        },
        active: complete,
        inactive: complete
      });
      return false;
    }
  });
}(W));
