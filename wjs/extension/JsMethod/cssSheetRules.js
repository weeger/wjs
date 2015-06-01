(function (WjsProto) {
  'use strict';
  WjsProto.register('JsMethod', 'cssSheetRules', function (domLink) {
    // On Firefox rules are stored into cssRules var
    if (domLink.hasOwnProperty('cssRules')) {
      return domLink.cssRules;
    }
    else if (domLink.rules) {
      return domLink.rules;
    }
    return false;
  });
}(WjsProto));
