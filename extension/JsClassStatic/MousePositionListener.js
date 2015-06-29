(function (WjsProto) {
  'use strict';
  /**
   * Listen mouse position on hole page.
   * Allow to get mouse position at any time
   * without to create a dedicated event.
   */
  WjsProto.register('JsClassStatic', 'MousePositionListener', {
    clientX: undefined,
    clientY: undefined,

    __construct: function () {
      this.mouseMoveBind = this.mouseMove.bind(this);
      this.wjs.window.addEventListener('mousemove', this.mouseMoveBind);
    },

    __destruct: function () {
      this.wjs.window.removeEventListener('mousemove', this.mouseMoveBind);
    },

    mouseMove: function (e) {
      this.clientX = e.clientX;
      this.clientY = e.clientY;
      // Trigger custom event.
      WjsProto.trigger('MousePositionListenerChange', [this]);
    }
  });
}(WjsProto));
