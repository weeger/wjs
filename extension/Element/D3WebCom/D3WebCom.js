/**
 * @require Element > Clip
 * @require JsClass > ThreeObject3d
 * @require JsClass > D3World
 */
(function (W) {
  'use strict';
  W.register('Element', 'D3WebCom', {
    classExtends: 'Element\\Clip',

    variables: {
      rotateH: 0,
      rotateP: 0,
      rotateB: 0,
      translateX: 0,
      translateY: 0,
      translateZ: 0
    },

    options: {
      zSort: {
        defaults: true,
        define: function (com, value, options) {
          com.optionApply('D3World', options);
          // World manage z sorting.
          if (value) {
            com.D3World.child3dSort.push(com);
          }
        }
      },
      D3World: {
        define: function (com, value) {
          if (!value) {
            if (!this.wjs.D3WorldGlobal) {
              this.wjs.D3WorldGlobal = new (this.wjs.classProto('D3World'))();
            }
            value = this.wjs.D3WorldGlobal;
          }
          return value;
        },
        /**
         * @require JsMethod > arrayDeleteItem
         */
        destroy: function (com, value) {
          if (value) {
            // Remove
            this.wjs.arrayDeleteItem(value.child3dSort, com);
          }
        }
      }
    },

    __construct: function () {
      // Create object for 3D calculations.
      this.object3d = new (this.wjs.classProto('ThreeObject3d'))(0, 1, 0);
      // Normal com construct.
      this.__super('__construct', arguments);
      // Custom init.
      this.init3D();
    },

    init3D: W._e,

    /**
     * Create a binder, set this as parent.
     */
    childAdd: function (options) {
      if (!this.isA('D3World')) {
        options.D3World = this.D3World;
      }
      else {
        options.D3World = this;
      }
      return this.__super('childAdd', [options]);
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
      object3d.rotateX(this.wjs.Math.degToRad(this.variableGet('rotateH')));
      object3d.rotateY(this.wjs.Math.degToRad(this.variableGet('rotateP')));
      object3d.rotateZ(this.wjs.Math.degToRad(this.variableGet('rotateB')));

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
}(W));
