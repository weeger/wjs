(function (WjsProto) {
  'use strict';
  WjsProto.register('Plugin', 'D3ClipTarget', {

    options: {
      targetX: 0,
      targetY: 0,
      targetZ: 1000
    },

    variables: {
      target: null
    },

    initPlugin: function () {
      // Target is a position vector.
      this.target = new (this.wjs.classProto('MathVector3'))(0, 0, 0);
    },

    elementInit: function (element) {
      // One stage allowed
      this.D3World = element.D3World;
    },

    renderDom: function (element) {
      element.object3d.updateMatrix();
      element.object3d.updateMatrixWorld();
      var target = new (this.wjs.classProto('MathVector3'))(
        this.variableGet('targetX'),
        this.variableGet('targetY'),
        this.variableGet('targetZ')
      );
      element.object3d.lookAt(element.object3d.worldToLocal(target));
    }
  });
}(WjsProto));
