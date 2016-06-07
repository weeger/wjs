(function (W) {
  'use strict';
  /**
   * @require JsClassStatic > ScrollManager
   */
  W.register('Formula', 'ScrollManagerValue', {
    eventTrigger: true,

    init: function () {
      this.w.window.addEventListener('ScrollManagerChange', this.updateEventProxy);
    },

    exit: function () {
      this.w.window.removeEventListener('ScrollManagerChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.w.ScrollManager['scroll' + formula.direction] || 0;
    }
  });
}(W));
