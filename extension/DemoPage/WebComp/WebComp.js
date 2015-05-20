/**
 * @require JsMethod > eventTransitionName
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('DemoPage', 'WebComp', {
    optionsDefault: {
      requireStatic: {
        WebComp:['SharedComp']
      }
    }
  });
}(WjsProto));
