/**
 * Clips have a specific centered positioning system.
 * @require Element > Sprite
 */
(function (W) {
  'use strict';
  W.register('Element', 'Clip', {
    classExtends: 'Element\\Sprite',

    options: {
      // By default, use offsetWidth
      width: NaN,
      height: NaN,
      top: {
        defaults: NaN,
        define: function (com, value, options) {
          com.optionApply('dom', options);
          if (isNaN(value)) {
            if (com.dom && com.dom.style.top) {
              return parseFloat(com.dom.style.top);
            }
            return 0;
          }
          return value;
        }
      },
      left: {
        defaults: NaN,
        define: function (com, value, options) {
          com.optionApply('dom', options);
          if (isNaN(value)) {
            if (com.dom && com.dom.style.left) {
              return parseFloat(com.dom.style.left);
            }
            return 0;
          }
          return value;
        }
      }
    },

    optionsDefault: {
      html: ''
    },

    positionAdjust: function (positionData, relativeToBinder) {
      // Clip must have a parent to be repositioned.
      if (this.parent) {
        var relativeRect,
        // Rect is computed on render.
          rect = this.parent.domBoundingClientRect,
          output = {
            top: positionData.top + (rect.height - positionData.height) / 2,
            left: positionData.left + (rect.width - positionData.width) / 2,
            width: positionData.width,
            height: positionData.height
          };
        // Adjust according given element.
        if (relativeToBinder) {
          relativeRect = relativeToBinder.getRect();
          output.top += relativeRect.top;
          output.left += relativeRect.left;
        }
        return output;
      }
      return positionData;
    },

    renderReset: function () {
      // Get local value or detect from dom.
      this.width = !isNaN(this.width) ? this.width : this.domBoundingClientRect.width;
      this.height = !isNaN(this.height) ? this.height : this.domBoundingClientRect.height;
      // We not extend base who is an empty object.
      return {
        top: this.variableGet('top'),
        left: this.variableGet('left'),
        // Allow to inherit width / height from CSS.
        width: this.variableGet('width'),
        height: this.variableGet('height')
      };
    },

    renderDom: function (renderData) {
      if (this.dom) {
        renderData = this.positionAdjust(renderData);
        // Use margin positioning system to center clip
        // It allow to center it into a "non element" dom object
        // which can have a changing with / height.
        var i = 0, item, properties = ['top', 'left', 'width', 'height'];
        while (item = properties[i++]) {
          this.dom.style[item] = renderData[item] + 'px';
        }
      }
    }
  });
}(W));
