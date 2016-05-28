(function (W) {
  'use strict';
  /**
   * @require JsClassStatic > ScrollManager
   */
  W.register('Formula', 'ScrollManagerValue', {
    eventTrigger: true,

    initFormula: function () {
      this.wjs.window.addEventListener('ScrollManagerChange', this.updateEventProxy);
    },

    exitFormula: function () {
      this.wjs.window.removeEventListener('ScrollManagerChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.wjs.ScrollManager['scroll' + formula.direction] || 0;
    }
  });
}(W));
