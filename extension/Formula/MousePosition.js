(function (W) {
  'use strict';
  /**
   * @require JsClassStatic > MousePositionListener
   */
  W.register('Formula', 'MousePosition', {
    eventTrigger: true,

    initFormula: function () {
      this.w.window.addEventListener('MousePositionListenerChange', this.updateEventProxy);
    },

    exitFormula: function () {
      this.w.window.removeEventListener('MousePositionListenerChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.w.MousePositionListener['client' + formula.direction] || 0;
    }
  });
}(W));
