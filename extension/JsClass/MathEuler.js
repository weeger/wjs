(function (W) {
  'use strict';
  /**
   * Imported from ThreeJS
   * https://github.com/mrdoob/three.js/
   * @require JsClassStatic > Math
   */
  W.register('JsClass', 'MathEuler', {
    __construct: function (x, y, z) {
      this._x = x || 0;
      this._y = y || 0;
      this._z = z || 0;
      this.matrix = new (this.w.classProto('MathMatrix4'))();
    },

    setFromRotationMatrix: function (m, order, update) {
      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
      var te = m.elements;
      var m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
      var m22 = te[ 5 ], m23 = te[ 9 ];
      var m32 = te[ 6 ], m33 = te[ 10 ];
      // Order is XYZ
      this._y = Math.asin(this.w.Math.clamp(m13, -1, 1));
      if (Math.abs(m13) < 0.99999) {
        this._x = Math.atan2(-m23, m33);
        this._z = Math.atan2(-m12, m11);
      } else {
        this._x = Math.atan2(m32, m22);
        this._z = 0;
      }
      if (update !== false) {
        this.onChangeCallback();
      }

      return this;

    },

    setFromQuaternion: function (q, order, update) {
      this.matrix.makeRotationFromQuaternion(q);
      this.setFromRotationMatrix(this.matrix, order, update);
      return this;
    },

    onChange: function (callback) {
      this.onChangeCallback = callback;
      return this;
    },

    onChangeCallback: function () {
    }

  });
}(W));
