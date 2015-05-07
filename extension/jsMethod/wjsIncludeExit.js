(function (WjsProto) {
  'use strict';
  /**
   * @require JsMethod > wjsIncludeScan
   */
  WjsProto.register('JsMethod', 'wjsIncludeExit', function (dom, callback, queued, keep) {
    var i = 0, includes = this.wjsIncludeScan(dom), destroyQueue = [], type,
      item, split, localCallbackCount = 0, localCallback = function () {
        if ((destroyQueue.length === 0 || ++localCallbackCount === destroyQueue.length) &&
          callback) {
          complete();
        }
      },
      complete = function () {
        if (callback) {
          callback();
        }
      };
    while (item = includes[i++]) {
      type = item.getAttribute('type');
      split = type.split(':');
      // Avoid exclusions
      if (!keep || !keep[type]) {
        // Include tag is just a container
        // we search for first item.
        item = this.loaders[split[0]].webCompList[item.childNodes[0].getAttribute('id')];
        destroyQueue.push(item);
        if (!queued) {
          item.exit(localCallback);
        }
      }
    }
    if (queued) {
      queueExec(destroyQueue, localCallback);
    }
    // We are not in queued mode,
    // And no includes found.
    else if (destroyQueue.length === 0) {
      complete();
    }
  });

  /**
   * Process local queue.
   * @param destroyQueue
   * @param localCallback
   */
  function queueExec(destroyQueue, localCallback) {
    // Use only one request.
    if (destroyQueue.length > 0) {
      destroyQueue.shift().exit(function () {
        queueExec(destroyQueue, localCallback);
      });
    }
    // We are not in queued mode,
    // And no includes found.
    else {
      localCallback();
    }
  }
}(WjsProto));
