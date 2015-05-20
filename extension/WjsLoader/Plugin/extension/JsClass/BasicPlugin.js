/**
 * @require JsClass > BasicBinder
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicPlugin', {
    type: 'Plugin',
    classExtends: 'BasicBinder',
    variables: {
      binderType: 'Element'
    },

    options: {
      binder: {
        defaults: null,
        define: function (value) {
          if (!value || !value.isA(this.binderType)) {
            this.error('Binder type ' + value.typeGlobal +
              ' not allowed for plugin ' + this.type +
              ', expected ' + this.binderType);
          }
          return value;
        }
      }
    }
  });
}(WjsProto));
