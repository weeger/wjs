(function (W) {
  'use strict';
  /**
   * @require JsClassStatic > AccelerometerListener
   */
  W.register('Formula', 'Accelerometer', {
    eventTrigger: true,

    initFormula: function () {
      this.w.window.addEventListener('DeviceOrientationChange', this.updateEventProxy);
    },

    exitFormula: function () {
      this.w.window.removeEventListener('DeviceOrientationChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.w.AccelerometerListener[formula.direction] || 0;
    }
  });
}(W));
