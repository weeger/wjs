(function (W) {
  'use strict';
  /**
   * @require Element > D3Container
   */
  W.register('Element', 'D3ContainerRing', {
    classExtends: 'Element\\D3Container',

    optionsDefault: {
      dom: true
    },

    options: {
      radius: 240
    },

    Pi2: Math.PI * 2,

    renderReset: function () {
      this.radiusRendered = this.variableGet('radius');
      return this.__super('renderReset', arguments);
    },

    renderChild: function (element, player) {
      var angle = (this.Pi2 / (element.parent.children.length)) * element.parent.children.indexOf(element);
      element.translateX = Math.cos(angle) * this.radiusRendered;
      element.translateZ = Math.sin(angle) * this.radiusRendered;
      this.__super('renderChild', arguments);
    }
  });
}(W));
