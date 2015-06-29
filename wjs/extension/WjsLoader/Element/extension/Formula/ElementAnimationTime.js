(function (WjsProto) {
  'use strict';
  WjsProto.register('Formula', 'ElementAnimationTime', {
    result: function (formula, element) {
      element.frameNextEnable();
      return (element.playPlayer.playFrameStamp - element.playPlayer.playStampStart) / 1000;
    }
  });
}(WjsProto));
