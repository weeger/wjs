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
    }
  });
}(WjsProto));
