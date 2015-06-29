/**
 * @require WjsLoader > Binder
 * @require JsScript > SchemeElement
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'Element', {
    loaderExtends: 'Binder',
    protoBaseClass: 'Element'

//    protoParseAlterable: function (proto, scheme) {
//      var keys = Object.keys(scheme.alterable), key, i = 0, keyRef;
//      this.methodsFlatten(proto, scheme, 'alterable');
//      while (key = keys[i++]) {
//        keyRef = key;
//TODO
//        proto[key] = function () {
//          return this.pluginShared(keyRef, arguments, this[this.methodName('alterable.' + keyRef)]);
//        };
//      }
//    }
  });
}(WjsProto));
