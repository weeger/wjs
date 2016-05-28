(function (W) {
  'use strict';
  /**
   * Animate a property of an object.
   */
  W.register('JsMethod', 'animate', function (object, properties, options) {
    var timeStart = (new Date()).getTime(),
      duration = typeof options === 'object' ? options.duration : options,
      timeEnd = timeStart + duration, step, callback,
      interval = options.interval || 10,
      valuesAdd = {}, valuesOriginal = {}, i = 0, key, keys = Object.keys(properties),
      outputController = {}, win = this.window;
    // Create a local copy of original states.
    while (key = keys[i++]) {
      valuesOriginal[key] = object[key];
      valuesAdd[key] = properties[key] - object[key];
    }
    step = function (perc) {
      var i = 0;
      while (key = keys[i++]) {
        object[key] = valuesOriginal[key] + (valuesAdd[key] * perc);
      }
      if (options.step) {
        options.step(perc);
      }
    };
    callback = function () {
      var timeRemain = timeEnd - (new Date()).getTime();
      if (timeRemain < interval) {
        step(1);
        if (options.complete) {
          options.complete();
        }
      }
      else {
        step(1 - (timeRemain / duration));
        outputController.timeout = win.setTimeout(callback, interval);
      }
    };
    callback();
    // Create a function for stop
    outputController.stop = function () {
      win.clearTimeout(outputController.timeout);
    };
    return outputController;
  });
}(W));
