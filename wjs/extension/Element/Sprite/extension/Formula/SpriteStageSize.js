(function (WjsProto) {
  'use strict';
  WjsProto.register('Formula', 'SpriteStageSize', {
    // TODO onresize ?

    result: function (formula, element) {
      // TODO : Calc once by render
      return element.stage.dom.getBoundingClientRect()[formula.direction];
    }
  });
}(WjsProto));
