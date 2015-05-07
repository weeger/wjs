(function (WjsProto) {
  'use strict';
  /**
   * Here is the main function of the full site navigation management.
   * @require JsClass > BasicDemoPage
   */
  WjsProto.register('WjsLoader', 'DemoPage', {
    loaderExtends: 'WebPage',
    protoBaseClass: 'BasicDemoPage',

    /**
     * Hook called at loader creation,
     * we save references to page dom objects,
     * and initialize buttons.
     */
    __construct: function () {
      var wjs = this.wjs;
      wjs.loaders.WebPage.__construct.apply(this);
      // Key press handler.
      wjs.window.addEventListener('keydown', this.eventKeydown.bind(this));
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
          this.pageChange('previous');
          break;
        // Right arrow
        case 39 :
          this.pageChange('next');
          break;
      }
    }
  });
  // [-->
}(WjsProto));
