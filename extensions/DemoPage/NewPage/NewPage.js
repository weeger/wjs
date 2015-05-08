/**
 * @require JsMethod > eventTransitionName
 * @require WebComp > SharedComp
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('DemoPage', 'NewPage', {
    optionsDefault: {
      domDestination: '#main-page-body',
      requireStatic: {
        WebComp: ['SharedComp']
      }
    }
  });
}(WjsProto));
