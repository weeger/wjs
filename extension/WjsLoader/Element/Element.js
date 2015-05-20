/**
 * @require WjsLoader > Binder
 * @require JsClass > BasicElement
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'Element', {
    loaderExtends: 'Binder',
    protoBaseClass: 'BasicElement'
  });
}(WjsProto));
