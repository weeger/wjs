/**
 * @require WjsLoader > Binder
 * @require JsScript > SchemePlugin
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'Plugin', {
    loaderExtends: 'Binder',
    protoBaseClass: 'Plugin'
  });
}(WjsProto));
