(function (W) {
  'use strict';
  /**
   * @require JsSingleton > MousePositionListener
   */
  W.register('Formula', 'MousePosition', {
    eventTrigger: true,

    init: function () {
      this.w.window.addEventListener('MousePositionListenerChange', this.updateEventProxy);
    },

    exit: function () {
      this.w.window.removeEventListener('MousePositionListenerChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.w.MousePositionListener['client' + formula.direction] || 0;
    }
  });
}(W));
