(function (WjsProto) {
  'use strict';
  WjsProto.register('Formula', 'SpriteStageSize', {
    result: function (formula, element) {
      // Client rect is updated on render.
      return element.stage.domBoundingClientRect[formula.direction];
    }
  });
}(WjsProto));
