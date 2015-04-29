(function (WjsProto) {
  'use strict';
  /**
   * @require JsMethod > eventTransitionName
   */
  WjsProto.register('JsMethod', 'cssAnimateCallback', function (dom, className, callback) {
    var transitionEvent = this.eventTransitionName(),
      callbackLocal = function (e) {
        // Animation should be on the main item only.
        if (e.target === dom) {
          e.stopPropagation();
          dom.removeEventListener(transitionEvent, callbackLocal);
          if (callback === true) {
            dom.classList.remove(className);
          }
          else if (callback) {
            callback(e);
          }
        }
      };
    dom.addEventListener(transitionEvent, callbackLocal);
    dom.classList.add(className);
  });
}(WjsProto));
