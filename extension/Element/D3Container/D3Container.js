/**
 * @require Element > D3WebCom
 */
(function (W) {
  'use strict';
  W.register('Element', 'D3Container', {
    classExtends: 'Element\\D3WebCom',
    default: {
      dom: true,
      // Containers are not sorted in z
      // this prevent to have all children placed
      // before or in front of other 3d containers.
      zSort: false
    },

    elementAppend: function (element) {
      element.object3d.parent = this.object3d;
      this.__super('elementAppend', arguments);
    },

    renderDom: function (renderData) {
      // Up.
      this.object3d.updateMatrixWorld();
      this.__super('renderDom', arguments);
    }
  });
}(W));
