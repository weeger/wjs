(function (WjsProto) {
  'use strict';
  WjsProto.register('Plugin', 'D3ClipTarget', {

    variables: {
      target: null
    },

    initPlugin: function () {
      this.target = new (this.wjs.classProto('MathVector3'))(0, 0, 1000);
      this.mouseMoveCallback = this.method('callbacks.mousemove').bind(this);
      this.wjs.window.addEventListener('mousemove', this.mouseMoveCallback);
    },

    exitPlugin: function () {
      this.wjs.window.removeEventListener('mousemove', this.mouseMoveCallback);
    },

    elementInit: function (element) {
      // One stage allowed
      this.D3World = element.D3World;
    },

    renderDom: function (element) {
      element.object3d.updateMatrix();
      element.object3d.updateMatrixWorld();
      var target = new (this.wjs.classProto('MathVector3'))(this.target.x, this.target.y, this.target.z);
      element.object3d.lookAt(element.object3d.worldToLocal(target));
    },

    callbacks: {
      mousemove: function (e) {
        var posX = this.target.x, posY = this.target.y;
        this.target.x = e.clientX - (this.D3World.stage.dom.clientWidth / 2);
        this.target.y = e.clientY - (this.D3World.stage.dom.clientHeight / 2);
        // Enable new frames on change only.
        if (this.target.x !== posX || this.target.y !== posY) {
//          TODO this.D3World.frameNextEnable()
          this.elementsEach(function (element) {
            element.frameNextEnable();
          });
        }
      }
    }
  });
}(WjsProto));
