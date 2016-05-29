(function (W) {
  'use strict';
  /**
   *
   */
  W.register('JsClassStatic', 'webPageKeyboardChange', {
    __construct: function () {
      // Key press handler.
      this.w.window.addEventListener('keydown', this.eventKeydown.bind(this));
    },

    /**
     * Manage keyboard keys for navigation.
     * @require JsMethod > eventKeyCode
     * @param e
     */
    eventKeydown: function (e) {
      switch (this.w.eventKeyCode(e)) {
        // Left arrow
        case 37 :
          this.w.loaders.WebPage.pageChange('previous');
          break;
        // Right arrow
        case 39 :
          this.w.loaders.WebPage.pageChange('next');
          break;
      }
    }
  });
}(W));
