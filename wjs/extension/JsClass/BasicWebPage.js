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
      }
    }

  });
}(WjsProto));
