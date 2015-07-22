(function (WjsProto) {
  'use strict';
  WjsProto.register('JsMethod', 'cssSheetRules', function (domLink) {
    // On Firefox rules are stored into cssRules var
    return domLink.cssRules || domLink.rules;
  });
}(WjsProto));
