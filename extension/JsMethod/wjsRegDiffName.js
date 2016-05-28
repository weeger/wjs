(function (W) {
  'use strict';
  /**
   * Return a registry of item from fromType::fromName
   * who are not registered into toType::toName.
   * @require JsMethod > wjsRegDiff
   */
  W.register('JsMethod', 'wjsRegDiffName', function (fromType, fromName, toType, toName) {
    var extRequire = this.extRequire;
    return this.wjsRegDiff(
      extRequire[fromType] && extRequire[fromType][fromName] ?
        extRequire[fromType][fromName] : {},
      extRequire[toType] && extRequire[toType][toName] ?
        extRequire[toType][toName] : {}
    );
  });
}(W));
