(function (WjsProto) {
  'use strict';
  /**
   * @require JsClassStatic > MousePositionListener
   */
  WjsProto.register('Formula', 'MousePosition', {
    eventTrigger: true,

    __construct: function () {
      this.wjs.loaders.JsClass.items.Formula.__construct.apply(this, arguments);
      this.wjs.window.addEventListener('MousePositionListenerChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.wjs.MousePositionListener['client' + formula.direction] || 0;
    }
  });
}(WjsProto));
