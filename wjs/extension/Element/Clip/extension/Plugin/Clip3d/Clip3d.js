(function (WjsProto) {
  'use strict';
  /**
   * @require JsClass > Object3d
   */
  WjsProto.register('Plugin', 'Clip3d', {

    /**
     * @require JsClass > MathMatrix4
     */
    binderInit: function (binder) {
      binder.object3d = new (this.wjs.classProto('Object3d'))(0, 1, 0);
    },

    matrixToCss: function (matrix) {
      return  'matrix3d(' + Array.prototype.slice.call(matrix.elements).join(',') + ')';
    },

    overrides: {
      variables: {
        rotateH: 0,
        rotateP: 0,
        rotateB: 0,
        translateX: 0,
        translateY: 0,
        translateZ: 0
      },

      methods: {

        renderReset: function (plugin) {
          var renderData = this.__base(), object3d = this.object3d;
          // Reset object quaternion.
          object3d.position.x =
            object3d.position.y =
              object3d.position.z =
                object3d.quaternion.x =
                  object3d.quaternion.y =
                    object3d.quaternion.z = 0;
          object3d.quaternion.w = 1;
          object3d.updateMatrix();
          object3d.updateMatrixWorld();
          this.clip3dTranslate(renderData, plugin);
          this.clip3dRotate(renderData, plugin);
          return renderData;
        },

        clip3dRotate: function (renderData, plugin) {
          var object3d = this.object3d, Math = this.wjs.Math;
          // Apply rotation.
          object3d.rotateX(Math.degToRad(this.rotateH));
          object3d.rotateY(Math.degToRad(this.rotateP));
          object3d.rotateZ(Math.degToRad(this.rotateB));
        },

        clip3dTranslate: function (renderData, plugin) {
          var object3d = this.object3d;
          // Apply position.
          object3d.translateX(this.translateX);
          object3d.translateY(-this.translateY);
          object3d.translateZ(-this.translateZ);
        },

        /**
         * @require JsClassStatic > Math
         */
        renderDom: function (renderData, plugin) {
          var object3d = this.object3d;
          // Compute matrix.
          object3d.updateMatrix();
          // Writable function for dom
          this.renderDomMatrix(object3d.matrixWorld, plugin);
          // Base DOM render.
          this.__base(renderData);
        },

        renderDomMatrix: function (matrix, plugin) {
          // Check if stage3d plugin is set on stage.
          if (this.stage.cameraWorldPosition) {
            // getWorldPosition() will execute updateMatrixWorld();
            this.distanceToCamera = this.object3d.getWorldPosition().distanceTo(this.stage.cameraWorldPosition);
          }
          // Convert to CSS.
          this.dom.style.transform = plugin.matrixToCss(matrix);
        }
      }
    }
  });
}(WjsProto));
