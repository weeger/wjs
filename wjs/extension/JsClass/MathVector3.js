(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'MathVector3', {

    __construct: function (x, y, z) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
    },

    copy: function (v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    },

    add: function (v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    },

    subVectors: function (a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      return this;
    },


    multiplyScalar: function (scalar) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      return this;
    },

    applyMatrix4: function ( m ) {

      // input: THREE.Matrix4 affine matrix

      var x = this.x, y = this.y, z = this.z;

      var e = m.elements;

      this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ];
      this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ];
      this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ];

      return this;

    },

    applyQuaternion: function (q) {

      var x = this.x;
      var y = this.y;
      var z = this.z;

      var qx = q.x;
      var qy = q.y;
      var qz = q.z;
      var qw = q.w;

      // calculate quat * vector

      var ix = qw * x + qy * z - qz * y;
      var iy = qw * y + qz * x - qx * z;
      var iz = qw * z + qx * y - qy * x;
      var iw = -qx * x - qy * y - qz * z;

      // calculate result * inverse quat

      this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
      this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
      this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

      return this;

    },

    divideScalar: function ( scalar ) {

      if ( scalar !== 0 ) {

        var invScalar = 1 / scalar;

        this.x *= invScalar;
        this.y *= invScalar;
        this.z *= invScalar;

      } else {

        this.x = 0;
        this.y = 0;
        this.z = 0;

      }

      return this;

    },

    length: function () {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    },

    normalize: function () {
      return this.divideScalar(this.length());
    },

    crossVectors: function (a, b) {
      var ax = a.x, ay = a.y, az = a.z,
        bx = b.x, by = b.y, bz = b.z;
      this.x = ay * bz - az * by;
      this.y = az * bx - ax * bz;
      this.z = ax * by - ay * bx;
      return this;
    },

    distanceTo: function (v) {
      return Math.sqrt(this.distanceToSquared(v));
    },

    distanceToSquared: function (v) {
      var dx = this.x - v.x;
      var dy = this.y - v.y;
      var dz = this.z - v.z;
      return dx * dx + dy * dy + dz * dz;
    },

    setFromMatrixPosition: function (m) {

      this.x = m.elements[ 12 ];
      this.y = m.elements[ 13 ];
      this.z = m.elements[ 14 ];

      return this;

    }

  });
}(WjsProto));
