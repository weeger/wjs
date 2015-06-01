/**
 * @require WjsLoader > Binder
 * @require JsClass > BasicPlugin
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'Plugin', {
    loaderExtends: 'Binder',
    protoBaseClass: 'BasicPlugin',
    instances: {},

    instanceOnce: function (name, options) {
      if (!this.instances[name]) {
        this.instances[name] = this.instance(name, options);
      }
      return this.instances[name];
    }
  });
}(WjsProto));
