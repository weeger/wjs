(function (WjsProto) {
  'use strict';
  WjsProto.register('Plugin', 'ClipDrag', {
    states: {
      mousePosition: {},
      dragdropPressed: false,
      mouseStartX: null,
      mouseStartY: null
    },

    options: {
      autoStart: {
        defaults: true
      },
      direction: {
        defaults: 'xy'
      },
      handle: {
        defaults: null
      }
    },

    binderInit: function (binder) {
      if (this.autoStart) {
        this.domListen(binder.dom, 'mousedown', 'clipMouseDown');
      }
    },

    binderExit: function (binder) {
      if (!this.autoStart) {
        this.domForget(binder.dom, 'mousedown', 'clipMouseDown');
      }
    },

    dragdropPress: function (binder, x, y) {
      // Save it to compute offset.
      this.mouseStartX = x;
      this.mouseStartY = y;
      this.clipStartX = binder.left;
      this.clipStartY = binder.top;
      binder.stage.dom.classList.add('ClipDragMouseDragging');
      if (this.handle) {
        this.handle.classList.add('ClipDragMouseDraggingHandle');
      }
      // Set state.
      this.stateSet('dragdropPressed', true);
    },

    dragdropRelease: function (binder) {
      // Save it to compute offset.
      this.mouseStartX =
        this.mouseStartY =
          this.clipStartX =
            this.clipStartY = null;
      binder.stage.dom.classList.remove('ClipDragMouseDragging');
      if (this.handle) {
        this.handle.classList.remove('ClipDragMouseDraggingHandle');
      }
      // Set state.
      this.stateSet('dragdropPressed', false);
    },

    callbacks: {
      stateSet: {
        dragdropPressed: function (value) {
          if (value) {
            // We attach binder on workspace and not on
            // sprite in order to get mouse behavior on
            // whole screen even if sprite is placed
            // behind another dom object.
            this.domListen(this.wjs.window, 'mouseup', 'dragdropPressedMouseUp');
            this.domListen(this.wjs.window, 'mousemove', 'dragdropPressedMouseMove');
          }
          else {
            this.domForget(this.wjs.window, 'mouseup', 'dragdropPressedMouseUp');
            this.domForget(this.wjs.window, 'mousemove', 'dragdropPressedMouseMove');
          }
        }
      },
      domListen: {
        clipMouseDown: function (e) {
          e.preventDefault();
          this.dragdropPress(this.wjs.loaders.WebComp.webCompList[e.target.id], e.clientX, e.clientY);
        },

        dragdropPressedMouseMove: function (e) {
          e.preventDefault();
          var self = this, mouseX = e.clientX, mouseY = e.clientY, direction = this.direction;
          this.bindersEach(function (binder) {
            if (direction === 'xy' || direction === 'y') {
              binder.top = self.clipStartY - (self.mouseStartY - mouseY);
            }
            if (direction === 'xy' || direction === 'x') {
              binder.left = self.clipStartX - (self.mouseStartX - mouseX);
            }
            binder.frameNextEnable();
          });
        },

        dragdropPressedMouseUp: function (e) {
          this.dragdropRelease(this.wjs.loaders.WebComp.webCompList[e.target.id]);
        }
      }
    }
  });
}(WjsProto));
