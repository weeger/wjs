/**
 * @require JsClass > ThreeCamera
 */
(function (W) {
  'use strict';
  W.register('JsClass', 'D3World', {

    __construct: function (domContainer, cameraZ, perspective) {
      // Perspective angle.
      this.perspective = perspective || 1000;
      // This is probably not the best way to get the global dom container
      // at least we should not have a dependency to elements loader,
      // or we should define it more explicitly.
      this.domStage = domContainer || this.wjs.loaders.Element.stageDefault;
      this.domStage.dom.style.perspective = this.perspective + 'px';
      this.domStageUpdate = this.update.bind(this);
      this.domStage.dom.addEventListener('playPlayerRender', this.domStageUpdate);
      // Global array for z sorting.
      this.child3dSort = [];
      // Global camera.
      this.camera = new (this.wjs.classProto('ThreeCamera'))(0, 1, 0);
      this.camera.translateZ(cameraZ || -1000);
      this.camera.updateMatrix();
      // First update.
      this.update();
    },

    update: function () {
      // Define
      this.cameraWorldPosition = this.camera.getWorldPosition();
      // Sort Z.
      var i = 0, item, sorted = this.child3dSort.sort(this.updateSortZCompare);
      // Sort dom children.
      while (item = sorted[i++]) {
        // Dom may disabled.
        if (item.dom) {
          item.dom.style.zIndex = i;
        }
      }
    },

    updateSortZCompare: function (a, b) {
      if (a.distanceToCamera > b.distanceToCamera) {
        return 1;
      }
      if (a.distanceToCamera < b.distanceToCamera) {
        return -1;
      }
      return 0;
    }
  });
}(W));
