(function (W) {
  'use strict';
  /**
   * Destroy a list of webcom.
   */
  W.register('JsMethod', 'webComExit', function (destroyQueue, callback, queued) {
    var localCallbackCount = 0, localCallback = function () {
        if (!destroyQueue.length || ++localCallbackCount === destroyQueue.length) {
          complete();
        }
      },
      complete = function () {
        if (callback) {
          callback();
        }
      };
    if (queued) {
      queueExec(destroyQueue, localCallback);
    }
    // We are not in queued mode,
    // And no includes found.
    else if (destroyQueue.length) {
      // Execute all list
      for (var i = 0, item; item = destroyQueue[i++];) {
        item.exit(localCallback);
      }
    }
    else {
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
}(W));
