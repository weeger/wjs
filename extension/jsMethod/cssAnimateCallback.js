(function (WjsProto) {
  'use strict';
  /**
   * Add a css class then a callback when finished.
   * If callback is not defined, simply remove the class.
   * Class should exists in order get complete event.
   * @require JsMethod > eventTransitionName
   */
  WjsProto.register('JsMethod', 'cssAnimateCallback', function (dom, callback, timeLimit) {
    var transitionEvent = this.eventTransitionName(), self = this,
      callbackLocal = function (e) {
        // Animation should be on the main item only.
        if (e.target === dom) {
          // Remove listener.
          e.stopPropagation();
          dom.removeEventListener('cssAnimateStop', callbackLocal);
          dom.removeEventListener(transitionEvent, callbackLocal);
          // Execute.
          if (callback) {
            callback(e);
          }
        }
      };
    dom.addEventListener('cssAnimateStop', callbackLocal);
    dom.addEventListener(transitionEvent, callbackLocal);
    if (timeLimit !== undefined) {
      this.async(function () {
        self.trigger('cssAnimateStop', undefined, dom);
      }, timeLimit);
    }
  });
}(WjsProto));
