(function (WjsProto) {
  'use strict';
  /**
   * @require JsClassStatic > AccelerometerListener
   */
  WjsProto.register('Formula', 'Accelerometer', {
    eventTrigger: true,

    initFormula: function () {
      this.wjs.window.addEventListener('DeviceOrientationChange', this.updateEventProxy);
    },

    exitFormula: function () {
      this.wjs.window.removeEventListener('DeviceOrientationChange', this.updateEventProxy);
    },

    result: function (formula) {
      return this.wjs.AccelerometerListener[formula.direction] || 0;
    }
  });
}(WjsProto));
