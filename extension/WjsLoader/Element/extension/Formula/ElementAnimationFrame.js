(function (WjsProto) {
  'use strict';
  WjsProto.register('Formula', 'ElementAnimationFrame', {
    result: function (formula, element) {
      element.frameNextEnable();
      return element.playPlayer.playFrameCurrent;
    }
  });
}(WjsProto));
