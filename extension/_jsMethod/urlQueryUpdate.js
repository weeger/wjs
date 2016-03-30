(function (WjsProto) {
  'use strict';
  /**
   * Updates the window history with the given query parameter.
   * @require JsMethod > urlQueryBuild
   * @require JsMethod > urlQueryParse
   * @require JsMethod > objectFind
   */
  WjsProto.register('JsMethod', 'urlQueryUpdate', function (key, value) {
    // Get params.
    var params = this.urlQueryParse();
    // Merge objects.
    if (typeof key === 'object') {
      params = this.extendObject(params, key);
    }
    // Or replace value.
    else {
      this.objectFind(key, params, undefined, value);
    }
    // Save params.
    //this.window.history.replaceState(null, null, '?' + this.urlQueryBuild(params));
  });
}(WjsProto));
