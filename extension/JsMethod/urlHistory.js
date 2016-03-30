(function (WjsProto) {
  'use strict';
  /**
   * @require JsMethod > urlQueryBuild
   */
  WjsProto.register('JsMethod', 'urlHistory', function (method, path, queryString, stateObj) {
    // Update current path if defined.
    this.settings.pathRequest = typeof path === 'string' ? path : this.settings.pathRequest;
    // Update full path.
    this.settings.pathFull = this.settings.pathWebsite + this.settings.pathRequest;
    // Build search query.
    queryString = queryString ? '?' + this.urlQueryBuild(queryString) : this.document.location.search;
    // Apply.
    this.window.history[method + 'State'](stateObj, null,
      // http://...com/
      this.window.location.origin + '/' +
        // New path
        this.settings.pathFull +
        // Query strings.
        queryString);
  });
}(WjsProto));
