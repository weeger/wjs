(function (WjsProto) {
  'use strict';
  /**
   * Stage 3D manages all 3D plugins.
   * @require JsClass > Camera
   */
  WjsProto.register('Plugin', 'Stage3d', {

    binderInit: function (binder) {
      binder.child3dSort = [];
      binder.camera = new (this.wjs.classProto('Camera'))(0, 1, 0);
      binder.camera.translateZ(-1000);
      binder.camera.updateMatrix();
    },

    overrides: {
      methods: {
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
        }
      }
    }
  });
}(WjsProto));
