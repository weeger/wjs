(function (W) {
  'use strict';
  W.register('Formula', 'ElementAnimationTime', {
    result: function (formula, element) {
      element.frameNextEnable();
      return (element.playPlayer.playFrameStamp - element.playPlayer.playStampStart) / 1000;
    }
  });
}(W));
