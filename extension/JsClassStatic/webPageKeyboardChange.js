(function (W) {
  'use strict';
  /**
   *
   */
  W.register('JsClassStatic', 'webPageKeyboardChange', {
    __construct: function () {
      // Key press handler.
      this.wjs.window.addEventListener('keydown', this.eventKeydown.bind(this));
    },

    /**
     * Manage keyboard keys for navigation.
     * @require JsMethod > eventKeyCode
     * @param e
     */
    eventKeydown: function (e) {
      switch (this.wjs.eventKeyCode(e)) {
        // Left arrow
        case 37 :
          this.wjs.loaders.WebPage.pageChange('previous');
          break;
        // Right arrow
        case 39 :
          this.wjs.loaders.WebPage.pageChange('next');
          break;
      }
    }
  });
}(W));
