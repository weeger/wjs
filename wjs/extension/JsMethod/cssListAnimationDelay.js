/**
 * @require JsMethod > cssVendorPrefix
 */
(function (WjsProto) {
  'use strict';
  /**
   * Apply a animation delay for each items selected.
   */
  WjsProto.register('JsMethod', 'cssListAnimationDelay', function (domContainer, querySelector, timeOffset, timeGlobalDelay, timeOffsetMultiplier) {
    var i = 0, j, items = domContainer.querySelectorAll(querySelector), localTimeOffset = [];
    timeOffset = typeof timeOffset === 'number' || timeOffset.indexOf(',') === -1 ? [timeOffset] : timeOffset.split(',');
    timeGlobalDelay = timeGlobalDelay || 0;
    timeOffsetMultiplier = timeOffsetMultiplier || 1;
    for (; i < items.length; i++) {
      for (j = 0; j < timeOffset.length; j++) {
        localTimeOffset[j] = ((parseFloat(timeOffset[j]) * Math.pow(i,timeOffsetMultiplier)) + timeGlobalDelay) + 's';
      }
      items[i].style[this.cssVendorPrefix('animationDelay', items[i].style)] = localTimeOffset.join(',');
      items[i].classList.add('menu-fadein');
    }
  });
}(WjsProto));
