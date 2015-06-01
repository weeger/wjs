/**
 * @require Plugin > ClipPlugin
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Plugin', 'ClipFullscreen', {
    classExtends: 'BasicPlugin\\ClipPlugin',

    pluginInit: function () {
      // Listen for window resizing.
      this.domListen(window, 'resize', 'windowResize');
      // Create one common reference object.
      this.fullscreenSize = {};
      // First update.
      this.sizeUpdate();
    },

    binderInit: function (binder) {
      // Add common reference.
      binder.fullscreenSize = this.fullscreenSize;
    },

    sizeUpdate: function () {
      // HTML Document must be totally empty
      // in other case element height may be unstable.
      // Create
      this.fullscreenSize.width = this.wjs.window.innerWidth;
      this.fullscreenSize.height = this.wjs.window.innerHeight;
      // Enable frame render.
      this.bindersCall('frameNextEnable');
    },

    callbacks: {
      domListen: {
        windowResize: function () {
          this.sizeUpdate();
        }
      }
    },

    overrides: {
      methods: {
        renderReset: function () {
          var renderData = this.__base();
          renderData.width = this.fullscreenSize.width;
          renderData.height = this.fullscreenSize.height;
          return renderData;
        }
      }
    }
  });
}(WjsProto));
