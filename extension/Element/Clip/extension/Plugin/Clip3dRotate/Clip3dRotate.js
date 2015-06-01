(function (WjsProto) {
  'use strict';
  WjsProto.register('Plugin', 'Clip3dRotate', {
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

    required: [
      {type: 'Clip3d'}
    ],

    overrides: {
      methods: {
        clip3dRotate: function () {
          var renderData = this.__base(), Math = this.wjs.Math, object3d = this.object3d,
            plugin = this.pluginGet('Clip3dRotate'),
            frameNumber = this.playPlayer.playFrameCurrent;
          object3d.rotateX(Math.degToRad((frameNumber * plugin.speedH) % 360));
          object3d.rotateY(Math.degToRad((frameNumber * plugin.speedP) % 360));
          object3d.rotateZ(Math.degToRad((frameNumber * plugin.speedB) % 360));
          object3d.updateMatrix();
          object3d.updateMatrixWorld();
          // Infinite animation.
          this.frameNextEnable();
          return renderData;
        }
      }
    }
  });
}(WjsProto));
