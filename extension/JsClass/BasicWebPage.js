/**
 * Base class for WebComp elements.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicWebPage', {
    classExtends: 'BasicWebComp',

    options: {
      urlHistory: {
        defaults: true,
        unique: true
      },
      previous: {
        defaults: false
      },
      next: {
        defaults: false
      },
      requireStatic: {
        defaults: false,
        define: function (value, options) {
          if (value) {

          }
        }
      },
      require: {
        defaults: false,
        define: function (value, options) {
          // Requires dom option.
          this.optionApply('requireStatic', options);
          this.__base();
        }
      }
    }
  });
}(WjsProto));
