(function (W) {
  'use strict';
  W.register('Plugin', 'D3WebComRotate', {
    options: {
      speedH: {
        defaults: 1
      },
      speedP: {
        defaults: 1
      },
      speedB: {
        defaults: 1
      }
    },

    renderDom: function (element) {
      var Math = this.w.Math, object3d = element.object3d,
        frameNumber = element.playPlayer.playFrameCurrent;
      object3d.rotateX(Math.degToRad((frameNumber * this.speedH) % 360));
      object3d.rotateY(Math.degToRad((frameNumber * this.speedP) % 360));
      object3d.rotateZ(Math.degToRad((frameNumber * this.speedB) % 360));
      object3d.updateMatrix();
      object3d.updateMatrixWorld();
      // Infinite animation.
      element.frameNextEnable();
    }
  });
}(W));
