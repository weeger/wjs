/**
 * @require Plugin > ClipPlugin
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Plugin', 'ClipAutomation', {
    classExtends: 'BasicPlugin\\ClipPlugin',

    variables: {
      amplitude: 50,
      speed: 0.1
    },

    overrides: {
      methods: {
        renderReset: function () {
          var renderData = this.__base();
          renderData.top += (Math.sin(this.binder.playPlayer.playFrameNumber() * this.speed)) * this.amplitude;
          // Infinite animation.
          this.binder.frameNextEnable();
        }
      }
    }
  });
}(WjsProto));
