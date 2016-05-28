(function (W) {
  'use strict';
  W.register('Formula', 'SpriteStageSize', {
    result: function (formula, element) {
      // Client rect is updated on render.
      return element.stage.domBoundingClientRect[formula.direction];
    }
  });
}(W));
