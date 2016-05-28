(function (W) {
  'use strict';
  W.register('JsClassStatic', 'Math', {
    __construct: function () {
      this.degreeToRadiansFactor = Math.PI / 180;
      this.radianToDegreesFactor = Math.PI / 180;
    },

    clamp: function (x, a, b) {
      return ( x < a ) ? a : ( ( x > b ) ? b : x );
    },

    degToRad: function (degrees) {
      return degrees * this.degreeToRadiansFactor;
    },

    radToDeg: function (radians) {
      return radians * this.radianToDegreesFactor;
    }
  });
}(W));
