/**
 * @require WjsLoader > Binder
 * @require JsClass > BasicPlugin
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'Plugin', {
    loaderExtends: 'Binder',
    protoBaseClass: 'BasicPlugin'
  });
}(WjsProto));
