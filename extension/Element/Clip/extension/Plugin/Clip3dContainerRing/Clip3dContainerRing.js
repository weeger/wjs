(function (WjsProto) {
  'use strict';
  /**
   * @require Plugin > Clip3dContainer
   * @require Plugin > Clip3dContainerRingChild
   */
  WjsProto.register('Plugin', 'Clip3dContainerRing', {
    classExtends: 'BasicPlugin\\Clip3dContainer',

    options: {
      radius: 300,
      pluginChild:'Clip3dContainerRingChild'
    },

    overrides: {
      methods: {

      }
    }
  });
}(WjsProto));
