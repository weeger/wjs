(function (W) {
  'use strict';
  W.register('Formula', 'ElementAnimationFrame', {
    result: function (formula, element) {
      element.frameNextEnable();
      return element.playPlayer.playFrameCurrent;
    }
  });
}(W));
