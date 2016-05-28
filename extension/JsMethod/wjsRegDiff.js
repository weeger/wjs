(function (W) {
  'use strict';
  /**
   * Return a registry of item from registryFrom
   * who are not registered into registryTo.
   */
  W.register('JsMethod', 'wjsRegDiff', function (registryFrom, registryTo) {
    var diff = {};
    this.regEach(registryFrom, function (type, name) {
      if (!(registryTo[type] && registryTo[type].indexOf(name) !== -1)) {
        diff[type] = diff[type] || [];
        diff[type].push(name)
      }
    });
    return diff;
  });
}(W));
