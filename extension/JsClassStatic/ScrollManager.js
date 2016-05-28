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
      this.wjs.window.addEventListener('scroll', this.windowScrollBind);
      this.wjs.window.addEventListener('resize', this.windowResizeBind);
    },

    __destruct: function () {
      this.wjs.window.removeEventListener('scroll', this.windowScrollBind);
      this.wjs.window.removeEventListener('resize', this.windowResizeBind);
    },

    scrollEnable: function (direction, speed) {
      var domName = 'domScroll' + direction;
      if (!this[domName]) {
        var domScroll = this.wjs.document.createElement('div'), style = domScroll.style;
        this.wjs.document.body.appendChild(domScroll);
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
      style[direction === 'X' ? 'width' : 'height'] = (this.wjs.window.innerWidth * this['scrollSpeed' + direction]) + 'px';
      // Need at least one pixel to be active.
      style[direction === 'X' ? 'height' : 'width'] = '1px';
    },

    scrollGet: function (direction) {
      var method = 'scroll' + direction;
      return this.wjs.document.body[method] || this.wjs.document.documentElement[method];
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
      this.scrollXPercent = this.scrollX / this.wjs.window.innerWidth;
      this.scrollY = this.scrollGet('Top');
      this.scrollYPercent = this.scrollY / this.wjs.window.innerHeight;
      W.trigger('ScrollManagerChange', [this]);
    }
  });
}(W));
