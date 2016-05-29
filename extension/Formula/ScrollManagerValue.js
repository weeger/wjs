(function (W) {
  'use strict';
  /**
   * @require JsClassStatic > ScrollManager
   */
  W.register('Formula', 'ScrollManagerValue', {
    eventTrigger: true,

    initFormula: function () {
      this.w.window.addEventListener('ScrollManagerChange', this.updateEventProxy);
    },

    exitFormula: function () {
      this.w.window.removeEventListener('ScrollManagerChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.w.ScrollManager['scroll' + formula.direction] || 0;
    }
  });
}(W));
