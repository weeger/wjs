/**
 * @require Element > D3WebCom
 * @require JsClass > ThreeObject3d
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Element', 'D3Clip', {
    classExtends: 'Element\\D3WebCom',

    renderDom: function (renderData) {
      this.__super('renderDom', arguments);
      // getWorldPosition() will execute updateMatrixWorld();
      this.distanceToCamera = this.object3d.getWorldPosition().distanceTo(this.D3World.cameraWorldPosition);
      // Convert to CSS.
      this.dom.style.transform = this.matrixToCss(this.object3d.matrixWorld);
    },

    matrixToCss: function (matrix) {
      // Transform Array32 to Array then join.
      return  'matrix3d(' + Array.prototype.slice.call(matrix.elements).join(',') + ')';
    }
  });
}(WjsProto));
