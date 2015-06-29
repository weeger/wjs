/**
 * @require Element > D3WebCom
 * @require JsClass > ThreeCamera
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Element', 'D3World', {
    classExtends: 'Element\\D3WebCom',

    variables: {
      perspective: 1000,
      cameraWorldPosition: 0,
      child3dSort: []
    },

    optionsDefault: {
      // Element interacts with all his children.
      global: true,
      dom: true
    },

    init3D: function () {
      this.__super('init3D', arguments);
      this.camera = new (this.wjs.classProto('ThreeCamera'))(0, 1, 0);
      this.camera.translateZ(-1000);
      this.camera.updateMatrix();
    },

    render: function () {
      this.cameraWorldPosition = this.camera.getWorldPosition();
      this.__super('render', arguments);
      this.renderSortZ();
    },

    renderSortZ: function () {
      var i = 0, item, sorted = this.child3dSort.sort(this.renderSortZCompare);
      // Sort dom children
      while (item = sorted[i++]) {
        item.dom.style.zIndex = i;
      }
    },

    renderSortZCompare: function (a, b) {
      if (a.distanceToCamera > b.distanceToCamera) {
        return 1;
      }
      if (a.distanceToCamera < b.distanceToCamera) {
        return -1;
      }
      return 0;
    },

    globalChildAppend: function (child) {
      // Only one world allowed.
      child.D3World = this;
      child.object3d.parent = this.object3d;
      this.child3dSort.push(child);
    },

    /**
     * @require JsMethod > arrayDeleteItem
     */
    globalChildRemove: function (child) {
      // Remove
      this.wjs.arrayDeleteItem(this.child3dSort, child);
    },

    renderDom: function (renderData) {
      // Up.
      this.object3d.updateMatrixWorld();
      // IE wants perspective to be remembered...
      this.dom.style.perspective = this.perspective + 'px';
      this.__super('renderDom', arguments);
    }
  });
}(WjsProto));
