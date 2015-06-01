(function (WjsProto) {
  'use strict';
  /**
   * @require Plugin > Clip3dContainerChild
   */
  WjsProto.register('Plugin', 'Clip3dContainerRingChild', {
    classExtends: 'BasicPlugin\\Clip3dContainerChild',

    binderInit: function () {
      var self = this;
      // Children length changes, so we have to refresh everything.
      this.bindersEach(function (binder) {
        binder.angle = ((Math.PI * 2) / (binder.parent.children.length)) * binder.parent.children.indexOf(binder);
        binder.ringPositionX = Math.cos(binder.angle) * self.pluginParent.radius;
        binder.ringPositionZ = Math.sin(binder.angle) * self.pluginParent.radius;
      });
    },

    overrides: {
      methods: {
        clip3dTranslate: function () {
          this.object3d.translateX(this.ringPositionX);
          this.object3d.translateZ(this.ringPositionZ);
        }
      }
    }
  });
}(WjsProto));
