(function (W) {
  'use strict';
  /**
   * Listen mouse position on hole page.
   * Allow to get mouse position at any time
   * without to create a dedicated event.
   */
  W.register('JsSingleton', 'MousePositionListener', {
    clientX: undefined,
    clientY: undefined,

    __construct: function () {
      this.mouseMoveBind = this.mouseMove.bind(this);
      this.clientX = this.w.window.screen.width / 2;
      this.clientY = this.w.window.screen.height / 2;
      this.w.window.addEventListener('mousemove', this.mouseMoveBind);
    },

    __destruct: function () {
      this.w.window.removeEventListener('mousemove', this.mouseMoveBind);
    },

    mouseMove: function (e) {
      this.clientX = e.clientX;
      this.clientY = e.clientY;
      // Trigger custom event.
      W.trigger('MousePositionListenerChange', [this]);
    }
  });
}(W));
