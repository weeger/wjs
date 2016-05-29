(function (W) {
  'use strict';
  /**
   * Simulate scroll for interactive management.
   */
  W.register('JsClassStatic', 'ScrollManager', {
    scrollX: null,
    scrollY: null,
    scrollSpeedX: false,
    scrollSpeedY: false,

    __construct: function () {
      this.windowScrollBind = this.windowScroll.bind(this);
      this.windowResizeBind = this.windowResize.bind(this);
      this.w.window.addEventListener('scroll', this.windowScrollBind);
      this.w.window.addEventListener('resize', this.windowResizeBind);
    },

    __destruct: function () {
      this.w.window.removeEventListener('scroll', this.windowScrollBind);
      this.w.window.removeEventListener('resize', this.windowResizeBind);
    },

    scrollEnable: function (direction, speed) {
      var domName = 'domScroll' + direction;
      if (!this[domName]) {
        var domScroll = this.w.document.createElement('div'), style = domScroll.style;
        this.w.document.body.appendChild(domScroll);
        style.position = 'absolute';
        style.visibility = 'hidden';
        style.top =
          style.left = '0';
        // Only created once.
        this[domName] = domScroll;
      }
      // Set speed.
      this.scrollParam(direction, speed);
      // Refresh style.
      this.scrollRefresh(direction);
    },

    scrollDisable: function (direction) {
      var domName = 'domScroll' + direction;
      if (this[domName]) {
        this[domName].parentNode.removeChild(this[domName]);
        delete this[domName];
      }
    },

    scrollParam: function (direction, speed) {
      this['scrollSpeed' + direction] = speed;
      this.scrollRefresh(direction);
    },

    scrollRefresh: function (direction) {
      var style = this['domScroll' + direction].style;
      // Define width / height.
      style[direction === 'X' ? 'width' : 'height'] = (this.w.window.innerWidth * this['scrollSpeed' + direction]) + 'px';
      // Need at least one pixel to be active.
      style[direction === 'X' ? 'height' : 'width'] = '1px';
    },

    scrollGet: function (direction) {
      var method = 'scroll' + direction;
      return this.w.document.body[method] || this.w.document.documentElement[method];
    },

    windowResize: function () {
      if (this.domScrollX) {
        this.scrollRefresh('X');
      }
      if (this.domScrollY) {
        this.scrollRefresh('Y');
      }
    },

    windowScroll: function () {
      this.scrollX = this.scrollGet('Left');
      this.scrollXPercent = this.scrollX / this.w.window.innerWidth;
      this.scrollY = this.scrollGet('Top');
      this.scrollYPercent = this.scrollY / this.w.window.innerHeight;
      W.trigger('ScrollManagerChange', [this]);
    }
  });
}(W));
