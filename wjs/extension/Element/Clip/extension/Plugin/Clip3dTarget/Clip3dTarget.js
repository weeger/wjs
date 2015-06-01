(function (WjsProto) {
  'use strict';

  WjsProto.register('Plugin', 'Clip3dTarget', {

    required: [
      {type: 'Clip3d'}
    ],

    pluginInit: function () {
      var self = this;
      self.target = new (this.wjs.classProto('MathVector3'))(0, 0, 1000);
      window.addEventListener('mousemove', function (e) {
        var posX = self.target.x, posY = self.target.y;
        if (self.globalStage) {
          self.target.x = e.clientX - (self.globalStage.dom.clientWidth / 2);
          self.target.y = e.clientY - (self.globalStage.dom.clientHeight / 2);
          // Enable new frames on change only.
          if (self.target.x !== posX || self.target.y !== posY) {
            self.bindersEach(function (binder) {
              binder.frameNextEnable();
            });
          }
        }
      });
    },

    binderInit: function (binder) {
      // One stage allowed
      this.globalStage = binder.stage;
    },

    overrides: {
      methods: {

        clip3dRotate: function () {
          var pluginTarget = this.pluginGet('Clip3dTarget'), object3d = this.object3d;
          var target = new (this.wjs.classProto('MathVector3'))(pluginTarget.target.x, pluginTarget.target.y, pluginTarget.target.z);
          this.object3d.lookAt(object3d.worldToLocal(target));
        }
      }
    }
  });
}(WjsProto));
