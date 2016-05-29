/**
 * @require Element > D3WebCom
 * @require JsClass > ThreeObject3d
 * @require JsMethod > cssVendorPrefix
 */
(function (W) {
  'use strict';
  W.register('Element', 'D3Clip', {
    classExtends: 'Element\\D3WebCom',

    renderDom: function (renderData) {
      this.__super('renderDom', arguments);
      // getWorldPosition() will execute updateMatrixWorld();
      this.distanceToCamera = this.object3d.getWorldPosition().distanceTo(this.D3World.cameraWorldPosition);
      // Dom may be disabled.
      if (this.dom) {
        // Convert to CSS.
        this.dom.style[this.w.cssVendorPrefix('transform')] = this.matrixToCss(this.object3d.matrixWorld);
      }
    },

    matrixToCss: function (matrix) {
      // Transform Array32 to Array then join.
      return  'matrix3d(' + Array.prototype.slice.call(matrix.elements).join(',') + ')';
    }
  });
}(W));
