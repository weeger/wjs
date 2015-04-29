(function (WjsProto) {
  'use strict';
  var params = null;
  /**
   * Return the value of a query parameter
   * @require JsMethod > urlQueryParse
   */
  WjsProto.register('JsMethod', 'urlQueryGet', function (name, defaults, query, reload) {
    if (!params || reload) {
      params = this.urlQueryParse(query);
    }
    return params.hasOwnProperty(name) ? params[name] : defaults;
  });
}(WjsProto));
