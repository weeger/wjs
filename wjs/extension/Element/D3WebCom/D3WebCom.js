/**
 * @require Element > Clip
 * @require JsClass > ThreeObject3d
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Element', 'D3WebCom', {
    classExtends: 'Element\\Clip',

    variables: {
      rotateH: 0,
      rotateP: 0,
      rotateB: 0,
      translateX: 0,
      translateY: 0,
      translateZ: 0
    },

    __construct: function () {
      this.init3D();
      this.__super('__construct', arguments);
    },

    init3D: function () {
      this.object3d = new (this.wjs.classProto('ThreeObject3d'))(0, 1, 0);
    },

    renderReset: function () {
      var renderData = this.__super('renderReset'),
        object3d = this.object3d;
      // Reset object quaternion.
      object3d.position.x =
        object3d.position.y =
          object3d.position.z =
            object3d.quaternion.x =
              object3d.quaternion.y =
                object3d.quaternion.z = 0;
      object3d.quaternion.w = 1;
      // Apply position.
      object3d.translateX(this.translateX);
      object3d.translateY(-this.translateY);
      object3d.translateZ(-this.translateZ);
      // Apply rotation.
      object3d.rotateX(this.wjs.Math.degToRad(this.result(this.rotateH)));
      object3d.rotateY(this.wjs.Math.degToRad(this.result(this.rotateP)));
      object3d.rotateZ(this.wjs.Math.degToRad(this.result(this.rotateB)));

      return renderData;
    },

    renderDom: function (renderData) {
      var object3d = this.object3d;
      // Compute matrix, object3d.updateMatrixWorld()
      // may have been executed before.
      object3d.updateMatrix();
      // Apply position.
      return this.__super('renderDom', arguments);
    },

    matrixToCss: function (matrix) {
      // Transform Array32 to Array then join.
      return  'matrix3d(' + Array.prototype.slice.call(matrix.elements).join(',') + ')';
    }
  });
}(WjsProto));
