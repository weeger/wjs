(function (W) {
  'use strict';
  /**
   * @require Plugin > ClipPlugin
   */
  W.register('Plugin', 'ClipDrag', {
    classExtends: 'Plugin\\ClipPlugin',

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

    elementAppend: function (element) {
      this.__super('elementAppend', arguments);
      if (this.autoStart) {
        var self = this;
        this.listen(element.dom, 'mousedown', function (e) {
          e.preventDefault();
          self.dragdropPress(element, e.clientX, e.clientY);
        });
      }
    },

    elementRemove: function (element) {
      this.__super('elementRemove', arguments);
      if (!this.autoStart) {
        this.forget(element.dom, 'mousedown');
      }
    },

    dragdropPress: function (element, x, y) {
      // Save it to compute offset.
      this.mouseStartX = x;
      this.mouseStartY = y;
      this.clipStartX = element.left;
      this.clipStartY = element.top;
      element.stage.dom.classList.add('ClipDragMouseDragging');

      if (this.handle) {
        this.handle.classList.add('ClipDragMouseDraggingHandle');
      }
      // Set state.
      this.stateSet('dragdropPressed', true);
    },

    dragdropRelease: function (element) {
      // Save it to compute offset.
      this.mouseStartX =
        this.mouseStartY =
          this.clipStartX =
            this.clipStartY = null;
      element.stage.dom.classList.remove('ClipDragMouseDragging');
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
            var self = this, element = self.element;
            // We attach element on workspace and not on
            // sprite in order to get mouse behavior on
            // whole screen even if sprite is placed
            // behind another dom object.
            this.domListen(this.w.window, 'mouseup', function () {
              self.dragdropRelease(element);
            });
            this.domListen(this.w.window, 'mousemove', function (e) {
              e.preventDefault();
              var mouseX = e.clientX, mouseY = e.clientY,
                direction = self.direction;
              if (direction === 'xy' || direction === 'y') {
                element.top = self.clipStartY - (self.mouseStartY - mouseY);
              }
              if (direction === 'xy' || direction === 'x') {
                element.left = self.clipStartX - (self.mouseStartX - mouseX);
              }
              element.frameNextEnable();
            });
          }
          else {
            this.domForget(this.w.window, 'mouseup');
            this.domForget(this.w.window, 'mousemove');
          }
        }
      }
    }
  });
}(W));
