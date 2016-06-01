(function (W) {
  'use strict';
  W.register('WjsLoader', 'CacheLink', {
    loaderExtends: 'JsLink',
    parse: function (name, value, process) {
      return this.w.loaders.JsLink.parse.call(this, name, w.settings.cachePath + name, process);
    }
  });
}(W));
