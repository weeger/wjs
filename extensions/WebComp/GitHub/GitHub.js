/**
 * @require JsMethod > eventTransitionName
 */
(function (context) {
  'use strict';
  context.wjs.staticClassWebComp('GitHub', {
    exit: function (type, name, value, process) {
      var self = this, i,
      // Get name of event to listen for the end of CSS animation.
        transitionEvent = this.wjs.eventTransitionName(),
        callback = function (e) {
          self.dom.removeEventListener(transitionEvent, callback, false);
          // We have to remove dom object manually.
          self.webCompRemove();
          // Save item as completely destroyed.
          process.itemDestroyComplete(type, name);
        };
      // Listen for animation end.
      self.dom.addEventListener(this.wjs.eventTransitionName(), callback, false);
      self.dom.classList.add('github-fadeout');

      // Returning file stops to destroy
      // dependencies for this item, but expect
      // destroyNext() to be launched by callback.
      return false;
    }
  });
}(wjsContext));