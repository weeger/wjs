/**
 * @require JsMethod > eventTransitionName
 * @re quire WebComp > SharedComp
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('DemoPage', 'NewPage', {
    optionsDefault: {
      domDestination: '#main-page-body',
//      require: {
//        WebComp:['SharedComp']
//      },
//      requireStatic: {
//        WebComp:['SharedComp']
//      }
    }
  });
}(WjsProto));
