/**
 * - Every sprite must be attached to a stage.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Element', 'Stage', {
    options: {
      playPlayer: true,
      autoPlay: true,
      dom: {
        define: function (com, value, options) {
          value = value || com.wjs.document.body;
          // Ball base function.
          return this.wjs.inheritMethod(this, 'define', [com, value, options]);
        },
        destroy: function (com) {
          if (com.dom !== com.wjs.document.body) {
            return this.wjs.inheritMethod(this, 'destroy', arguments);
          }
        }
      }
    }
  });
}(WjsProto));
