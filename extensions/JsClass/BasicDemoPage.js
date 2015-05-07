/**
 * Base class for WebComp elements.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicDemoPage', {
    classExtends: 'BasicWebPage',
    type: 'BasicDemoPage',
    variables: {
      cssClasses: [
        'BasicDemoPage'
      ]
    }
  });
}(WjsProto));
