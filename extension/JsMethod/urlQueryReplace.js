(function (W) {
  'use strict';
  /**
   * Updates the window history with the given query parameter.
   * @require JsMethod > urlHistory
   */
  W.register('JsMethod', 'urlQueryReplace', function (params, action) {
    return this.urlHistory(action || 'replace', undefined, params);
  });
}(W));
