/**
 * Clips have a specific centered positioning system.
 * @require Element > Sprite
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Element', 'Clip', {
    classExtends: 'Element\\Sprite',
    variables: {
      top: 0,
      left: 0
    },

    options: {
      width: 320,
      height: 240
    },

    optionsDefault: {
      html: '',
      top: 0,
      left: 0
    },

    positionAdjust: function (positionData, relativeToBinder) {
      // Clip must have a parent to be repositioned.
      if (this.parent) {
        var relativeRect,
          // TODO Calc once by rendered frame
          rect = this.parent.dom.getBoundingClientRect(),
          output = {
            top: positionData.top + (rect.height - positionData.height) / 2,
            left: positionData.left + (rect.width - positionData.width) / 2,
            width: positionData.width,
            height: positionData.height
          };
        // Adjust according given element.
        if (relativeToBinder) {
          relativeRect = relativeToBinder.dom.getBoundingClientRect();
          output.top += relativeRect.top;
          output.left += relativeRect.left;
        }
        return output;
      }
      return positionData;
    },

    renderReset: function () {
      // We not extend base who is an empty object.
      return {
        top: this.result(this.top),
        left: this.result(this.left),
        width: this.result(this.width),
        height: this.result(this.height)
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
    },

    bundle: {
      Null: {
        classExtends: 'Element\\Clip'
      }
    }
  });
}(WjsProto));
