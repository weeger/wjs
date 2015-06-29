/**
 * @require JsMethod > cssListAnimationDelay
 * @require JsMethod > eventTransitionName
 */
(function (context) {
  'use strict';
  context.wjs.staticClassWebComp('Menu', {
    init: function () {
      this.domContent = this.wjs.document.querySelector('#menu-content');
      this.domContent.style.display = '';
      this.wjs.cssListAnimationDelay(this.domContent, 'li', 0.1);
    },

    exit: function (type, name, value, process) {
      var self = this, i,
        items = this.domContent.querySelectorAll('li'),
        transitionEvent = this.wjs.eventTransitionName(),
        length = items.length,
        callbackCount = 0,
        callback = function (e) {
          callbackCount++;
          if (length === callbackCount) {
            self.domContent.removeEventListener(transitionEvent, callback, false);
            // We have to remove dom object manually.
            self.webCompRemove();
            // Save item as completely destroyed.
            process.itemDestroyComplete(type, name);
          }
        };

      for (i = 0; i < items.length; i++) {
        items[i].style.marginLeft = '0px';
        items[i].classList.add('menu-fadeout');
      }
      self.domContent.addEventListener(transitionEvent, callback, false);
      return false;
    }
  });
}(wjsContext));