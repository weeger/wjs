(function (WjsProto) {
  'use strict';
  /**
   * Add a css class then a callback when finished.
   * If callback is not defined, simply remove the class.
   * Class should exists in order get complete event.
   * @require JsMethod > eventTransitionName
   */
  WjsProto.register('JsMethod', 'cssAnimateCallback', function (dom, className, callback) {
    var transitionEvent = this.eventTransitionName(),
      callbackLocal = function (e) {
        // Animation should be on the main item only.
        if (e.target === dom) {
          e.stopPropagation();
          dom.removeEventListener(transitionEvent, callbackLocal);
          // Execute.
          if (typeof callback === 'function') {
            callback = callback(e);
          }
          // Undefined or true.
          if (callback === undefined || callback) {
            dom.classList.remove(className);
          }
        }
      };
    dom.addEventListener(transitionEvent, callbackLocal);
    dom.classList.add(className);
  });
}(WjsProto));
