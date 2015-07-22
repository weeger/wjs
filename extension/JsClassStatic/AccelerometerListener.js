(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClassStatic', 'AccelerometerListener', {
    alpha: undefined,
    beta: undefined,
    gamma: undefined,

    __construct: function () {
      this.deviceOrientationBind = this.deviceOrientation.bind(this);
      this.wjs.window.addEventListener('deviceorientation', this.deviceOrientationBind);
    },

    __destruct: function () {
      this.wjs.window.removeEventListener('deviceorientation', this.deviceOrientationBind);
    },

    deviceOrientation: function (e) {
      this.alpha = e.alpha;
      this.beta = e.beta;
      this.gamma = e.gamma;
      // Trigger custom event.
      WjsProto.trigger('DeviceOrientationChange', [this]);
    }
  });
}(WjsProto));
