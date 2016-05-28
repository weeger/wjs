/**
 * @require JsMethod > cssVendorPrefix
 */
(function (W) {
  'use strict';
  /**
   * Apply a animation delay for each items selected.
   * @require JsMethod > cssAnimateCallback
   */
  W.register('JsMethod', 'cssAnimationDelayOffset', function (domContainer, querySelector, timeOffset, timeGlobalDelay, timeOffsetMultiplier, animateOnce, reverse) {
    // Support array as first argument.
    var items = (Array.isArray(domContainer) ? domContainer : domContainer.querySelectorAll(querySelector)),
      i = (reverse ? items.length - 1 : 0), j, k = 0, localTimeOffset = [], item, prefixed;
    // Support comma separated values.
    timeOffset = typeof timeOffset === 'number' || timeOffset.indexOf(',') === -1 ? [timeOffset] : timeOffset.split(',');
    // Support global delay for all animation.
    timeGlobalDelay = timeGlobalDelay || 0;
    // Default linear animation.
    timeOffsetMultiplier = timeOffsetMultiplier || 1;
    // Iterates over results.
    while (item = items[(reverse ? i-- : i++)]) {
      prefixed = this.cssVendorPrefix('animationDelay');
      // Treat each animation.
      for (j = 0; j < timeOffset.length; j++) {
        localTimeOffset[j] = ((parseFloat(timeOffset[j]) * Math.pow(k++, timeOffsetMultiplier)) + timeGlobalDelay) + 's';
      }
      // Set style.
      item.style[prefixed] = localTimeOffset.join(',');
      if (animateOnce) {
        // Capture variables.
        (function (item, prefixed) {
          // Wait for current animation end.
          this.cssAnimateCallback(item, function () {
            // Remove css property.
            item.style[prefixed] = null;
          });
          // Bind to wjs on call.
        }).call(this, item, prefixed);
      }
    }
  });
}(W));
