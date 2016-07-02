(function (W) {
  'use strict';
  /**
   * @require JsSingleton > AccelerometerListener
   */
  W.register('Formula', 'Accelerometer', {
    eventTrigger: true,

    init: function () {
      this.w.window.addEventListener('DeviceOrientationChange', this.updateEventProxy);
    },

    exit: function () {
      this.w.window.removeEventListener('DeviceOrientationChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.w.AccelerometerListener[formula.direction] || 0;
    }
  });
}(W));
