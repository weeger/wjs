/**
 * @require JsMethod > eventTransitionName
 * @re quire WebComp > SharedComp
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('DemoPage', 'Overview', {
    optionsDefault: {
      domDestination: '#main-page-body',
      requireStatic: {
        WebComp:['SharedComp']
      }
    }
  });
}(WjsProto));
