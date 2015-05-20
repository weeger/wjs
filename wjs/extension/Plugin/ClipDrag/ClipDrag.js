(function (WjsProto) {
  'use strict';
  WjsProto.register('Plugin', 'ClipDrag', {
    classExtends: 'BasicPlugin',
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

    __construct: function () {
      this.wjs.inheritMethod(this, '__construct', arguments);
      if (this.autoStart) {
        this.domListen(this.binder.dom, 'mousedown', 'clipMouseDown');
      }
    },

    exit: function () {
      if (!this.autoStart) {
        this.domForget(this.binder.dom, 'mousedown', 'clipMouseDown');
      }
      this.wjs.inheritMethod(this, 'exit', arguments);
    },

    dragdropPress: function (x, y) {
      // Save it to compute offset.
      this.mouseStartX = x;
      this.mouseStartY = y;
      this.clipStartX = this.binder.left;
      this.clipStartY = this.binder.top;
      this.binder.stage.dom.classList.add('ClipDragMouseDragging');
      if (this.handle) {
        this.handle.classList.add('ClipDragMouseDraggingHandle');
      }
      // Set state.
      this.stateSet('dragdropPressed', true);
    },

    dragdropRelease: function () {
      // Save it to compute offset.
      this.mouseStartX =
        this.mouseStartY =
          this.clipStartX =
            this.clipStartY = null;
      this.binder.stage.dom.classList.remove('ClipDragMouseDragging');
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
          this.dragdropPress(e.clientX, e.clientY);
        },

        dragdropPressedMouseMove: function (e) {
          e.preventDefault();
          var mouseX = e.clientX, mouseY = e.clientY, i = 0, direction = this.direction;
          if (direction === 'xy' || direction === 'y') {
            this.binder.top = this.clipStartY - (this.mouseStartY - mouseY);
          }
          if (direction === 'xy' || direction === 'x') {
            this.binder.left = this.clipStartX - (this.mouseStartX - mouseX);
          }
          this.binder.render();
        },

        dragdropPressedMouseUp: function (e) {
          this.dragdropRelease();
        }
      }
    }
  });
}(WjsProto));
