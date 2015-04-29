(function (WjsProto) {
  'use strict';
  /**
   * @require JsMethod > wjsIncludeGet
   */
  WjsProto.register('JsMethod', 'wjsIncludeTagExit', function (dom, complete) {
    var i = 0, includes = this.wjsIncludeGet(dom), completeTotal = 0, completeCount = 0,
      item, split, callback = function () {
        if (++completeCount === completeTotal && complete) {
          complete();
        }
      };
    while (item = includes[i++]) {
      split = item.getAttribute('type').split(':');
      if (wjs.loaders[split[0]].webCompExit(split[1], callback)) {
        completeTotal++;
      }
    }
    if (completeTotal === 0) {
      callback();
    }
  });
}(WjsProto));
