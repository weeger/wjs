(function (WjsProto) {
  'use strict';
  /**
   * @require JsClassStatic > MousePositionListener
   */
  WjsProto.register('Formula', 'MousePosition', {
    eventTrigger: true,

    initFormula: function () {
      this.wjs.window.addEventListener('MousePositionListenerChange', this.updateEventProxy);
    },

    exitFormula: function () {
      this.wjs.window.removeEventListener('MousePositionListenerChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.wjs.MousePositionListener['client' + formula.direction] || 0;
    }
  });
}(WjsProto));
