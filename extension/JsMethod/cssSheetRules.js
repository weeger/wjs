(function (W) {
  'use strict';
  W.register('JsMethod', 'cssSheetRules', function (domLink) {
    // On Firefox rules are stored into cssRules var
    return domLink.cssRules || domLink.rules;
  });
}(W));
