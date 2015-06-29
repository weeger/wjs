(function (WjsProto) {
  'use strict';
  /**
   * Imported from ThreeJS
   * https://github.com/mrdoob/three.js/
   */
  WjsProto.register('JsClass', 'MathQuaternion', {

    __construct: function (x, y, z, w) {
      this._x = x || 0;
      this._y = y || 0;
      this._z = z || 0;
      this._w = ( w !== undefined ) ? w : 1;
    },


    get x() {
      return this._x;
    },

    set x(value) {
      this._x = value;
      this.onChangeCallback();
    },

    get y() {
      return this._y;
    },

    set y(value) {
      this._y = value;
      this.onChangeCallback();
    },

    get z() {
      return this._z;
    },

    set z(value) {
      this._z = value;
      this.onChangeCallback();
    },

    get w() {
      return this._w;
    },

    set w(value) {
      this._w = value;
      this.onChangeCallback();
    },

    setFromAxisAngle: function (axis, angle) {
      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
      // assumes axis is normalized
      var halfAngle = angle / 2, s = Math.sin(halfAngle);
      this._x = axis.x * s;
      this._y = axis.y * s;
      this._z = axis.z * s;
      this._w = Math.cos(halfAngle);
      this.onChangeCallback();
      return this;
    },

    setFromRotationMatrix: function ( m ) {

      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

      var te = m.elements,

        m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
        m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
        m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

        trace = m11 + m22 + m33,
        s;

      if ( trace > 0 ) {

        s = 0.5 / Math.sqrt( trace + 1.0 );

        this._w = 0.25 / s;
        this._x = ( m32 - m23 ) * s;
        this._y = ( m13 - m31 ) * s;
        this._z = ( m21 - m12 ) * s;

      } else if ( m11 > m22 && m11 > m33 ) {

        s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

        this._w = ( m32 - m23 ) / s;
        this._x = 0.25 * s;
        this._y = ( m12 + m21 ) / s;
        this._z = ( m13 + m31 ) / s;

      } else if ( m22 > m33 ) {

        s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

        this._w = ( m13 - m31 ) / s;
        this._x = ( m12 + m21 ) / s;
        this._y = 0.25 * s;
        this._z = ( m23 + m32 ) / s;

      } else {

        s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

        this._w = ( m21 - m12 ) / s;
        this._x = ( m13 + m31 ) / s;
        this._y = ( m23 + m32 ) / s;
        this._z = 0.25 * s;

      }

      this.onChangeCallback();

      return this;

    },

    multiply: function (q) {
      return this.multiplyQuaternions(this, q);
    },

    multiplyQuaternions: function (a, b) {
      // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
      var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
      var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
      this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
      this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
      this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
      this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
      this.onChangeCallback();
      return this;
    },

    onChange: function (callback) {
      this.onChangeCallback = callback;
      return this;
    },

    onChangeCallback: function () {
    }

  });
}(WjsProto));
