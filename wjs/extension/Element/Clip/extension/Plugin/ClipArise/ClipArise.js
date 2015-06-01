/**
 * @require Plugin > ClipPlugin
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Plugin', 'ClipArise', {
    classExtends: 'BasicPlugin\\ClipPlugin',

    options: {
      direction: {
        defaults: false
      },
      speed: {
        defaults: 20
      }
    },

    overrides: {
      methods: {
        renderReset: function (plugin) {
          var renderData = this.__base(), direction = plugin.direction, scale, add, pole,
            rect = this.parent.dom.getBoundingClientRect();

          if (direction) {
            if (direction === 'left' || direction === 'right') {
              pole = direction === 'left' ? -1 : 1;
              direction = 'left';
              scale = 'width';
            }
            else if (direction === 'top' || direction === 'bottom') {
              pole = direction === 'top' ? -1 : 1;
              direction = 'top';
              scale = 'height';
            }

            renderData[direction] = pole * ((rect[scale] + renderData[scale]) / 2);

            add = (this.playPlayer.playFrameNumber() * plugin.speed);
            if (add > renderData[scale]) {
              renderData[direction] += -pole * renderData[scale];
            }
            else {
              renderData[direction] += -pole * add;
              // Continue animation.
              this.frameNextEnable();
            }
          }
          return renderData;
        }
      }
    }
  });
}(WjsProto));
