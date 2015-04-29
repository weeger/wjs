(function (WjsProto) {
  'use strict';
  /**
   * @require JsMethod > wjsIncludeGet
   */
  WjsProto.register('JsMethod', 'wjsIncludeTagDestroy', function (dom, callback, queued, keep) {
    var i = 0, includes = this.wjsIncludeGet(dom), destroyed = [], type,
      item, split, request = {}, localCallbackCount = 0, localCallback = function () {
        localCallbackCount++;
        if (localCallbackCount === destroyed.length && callback) {
          complete();
        }
      },
      complete = function () {
        var item, i = 0;
        // Destroy dom include container.
        while (item = destroyed[i++]) {
          item.parentNode.removeChild(item);
        }
        if (callback) {
          callback();
        }
      };
    while (item = includes[i++]) {
      type = item.getAttribute('type');
      // Avoid exclusions
      if (!keep || !keep[type]) {
        destroyed.push(item);
        split = type.split(':');
        if (queued) {
          request[split[0]] = request[split[0]] || [];
          request[split[0]].push(split[1]);
        }
        else {
          this.destroy(split[0], split[1], {
            stacked: false,
            complete: localCallback
          });
        }
      }
    }
    if (queued) {
      // Use only one request.
      if (Object.keys(request).length > 0) {
        this.destroy(request, {
          stacked: false,
          complete: complete.bind(this)
        });
      }
      // Delay callback.
      return;
    }
    // We are not in queued mode,
    // And no includes found.
    if (destroyed.length === 0) {
      complete();
    }
  });
}(WjsProto));
