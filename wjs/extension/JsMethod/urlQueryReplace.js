(function (WjsProto) {
  'use strict';
  /**
   * Updates the window history with the given query parameter.
   * @require JsMethod > urlQueryBuild
   */
  WjsProto.register('JsMethod', 'urlQueryReplace', function (params, action) {
    // Save params.
    this.window.history[(action || 'replace') + 'State'](null, null, '/' + this.settings.pathFull + '?' + this.urlQueryBuild(params));
  });
}(WjsProto));
