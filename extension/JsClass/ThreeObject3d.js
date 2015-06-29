(function (WjsProto) {
  'use strict';
  /**
   * Imported from ThreeJS
   * https://github.com/mrdoob/three.js/
   * @require JsClass > MathQuaternion
   * @require JsClass > MathEuler
   * @require JsClass > MathVector3
   * @require JsClass > MathMatrix4
   */
  WjsProto.register('JsClass', 'ThreeObject3d', {
    __construct: function () {

      this.parent = undefined;

      this.up = new (this.wjs.classProto('MathVector3'))(0, 1, 0);

      var position = new (this.wjs.classProto('MathVector3'))();
      var rotation = new (this.wjs.classProto('MathEuler'))();
      var quaternion = new (this.wjs.classProto('MathQuaternion'))();
      var scale = new (this.wjs.classProto('MathVector3'))(1, 1, 1);

      var onRotationChange = function () {
        quaternion.setFromEuler(rotation, false);
      };

      var onQuaternionChange = function () {
        rotation.setFromQuaternion(quaternion, undefined, false);
      };

      rotation.onChange(onRotationChange);
      quaternion.onChange(onQuaternionChange);

      Object.defineProperties(this, {
        position: {
          enumerable: true,
          value: position
        },
        rotation: {
          enumerable: true,
          value: rotation
        },
        quaternion: {
          enumerable: true,
          value: quaternion
        },
        scale: {
          enumerable: true,
          value: scale
        }
      });

      this.matrix = new (this.wjs.classProto('MathMatrix4'))();
      this.matrixWorld = new (this.wjs.classProto('MathMatrix4'))();

      // Code style adjustments.
      this.rotateXv1 = new (this.wjs.classProto('MathVector3'))(1, 0, 0);
      this.rotateYv1 = new (this.wjs.classProto('MathVector3'))(0, 1, 0);
      this.rotateZv1 = new (this.wjs.classProto('MathVector3'))(0, 0, 1);
      this.rotateOnAxisQ1 = new (this.wjs.classProto('MathQuaternion'))(0, 0, 1);
      this.translateXv1 = new (this.wjs.classProto('MathVector3'))(1, 0, 0);
      this.translateYv1 = new (this.wjs.classProto('MathVector3'))(0, 1, 0);
      this.translateZv1 = new (this.wjs.classProto('MathVector3'))(0, 0, 1);
      this.lookAtm1 = new (this.wjs.classProto('MathMatrix4'))();
      this.translateOnAxisV1 = new (this.wjs.classProto('MathVector3'))(0, 0, 1);
      this.worldToLocalM1 = new (this.wjs.classProto('MathMatrix4'))();
    },

    rotateOnAxis: function (axis, angle) {
      // rotate object on axis in object space
      // axis is assumed to be normalized
      this.rotateOnAxisQ1.setFromAxisAngle(axis, angle);
      this.quaternion.multiply(this.rotateOnAxisQ1);
      return this;
    },

    rotateX: function (angle) {
      return this.rotateOnAxis(this.rotateXv1, angle);
    },

    rotateY: function (angle) {
      return this.rotateOnAxis(this.rotateYv1, angle);
    },

    rotateZ: function (angle) {
      return this.rotateOnAxis(this.rotateZv1, angle);
    },

    translateOnAxis: function (axis, distance) {
      // translate object by distance along axis in object space
      // axis is assumed to be normalized
      this.translateOnAxisV1.copy(axis).applyQuaternion(this.quaternion);
      this.position.add(this.translateOnAxisV1.multiplyScalar(distance));
      return this;
    },

    translateX: function (distance) {
      return this.translateOnAxis(this.translateXv1, distance);
    },

    translateY: function (distance) {
      return this.translateOnAxis(this.translateYv1, distance);
    },

    translateZ: function (distance) {
      return this.translateOnAxis(this.translateZv1, distance);
    },

    worldToLocal: function (vector) {
      return vector.applyMatrix4(this.worldToLocalM1.getInverse(this.matrixWorld));
    },

    lookAt: function (vector) {
      this.lookAtm1.lookAt(vector, this.position, this.up);
      this.quaternion.setFromRotationMatrix(this.lookAtm1);
    },

    getWorldPosition: function (optionalTarget) {
      var result = optionalTarget || new (this.wjs.classProto('MathVector3'))();
      this.updateMatrixWorld();
      return result.setFromMatrixPosition(this.matrixWorld);
    },

    updateMatrix: function () {
      this.matrix.compose(this.position, this.quaternion, this.scale);
    },

    updateMatrixWorld: function () {
      if (!this.parent) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }
    }
  });
}(WjsProto));
