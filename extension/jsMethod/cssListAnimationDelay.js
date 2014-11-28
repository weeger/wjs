/**
 * @require JsMethod > cssVendorPrefix
 */
(function (loader) {
  'use strict';
  /**
   * Apply a animation delay for each items selected.
   */
  loader.methodAdd('cssListAnimationDelay', function (domContainer, querySelector, timeOffset) {
    var i, j, items = domContainer.querySelectorAll(querySelector), localTimeOffset = [];
    timeOffset = typeof timeOffset === 'number' || timeOffset.indexOf(',') === -1 ? [timeOffset] : timeOffset.split(',');
    for (i = 0; i < items.length; i++) {
      for (j = 0; j < timeOffset.length; j++) {
        localTimeOffset[j] = (parseFloat(timeOffset[j]) * i) + 's';
      }
      items[i].style[this.cssVendorPrefix('animationDelay', items[i].style)] = localTimeOffset.join(',');
      items[i].classList.add('menu-fadein');
    }
  });
}(loader));