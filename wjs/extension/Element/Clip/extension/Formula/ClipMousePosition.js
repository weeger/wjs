(function (WjsProto) {
  'use strict';
  /**
   * @require JsClass > FormulaPreset
   * @require Formula > MousePosition
   * @require Formula > SpriteStageSize
   */
  WjsProto.register('Formula', 'ClipMousePosition', {
    classExtends: 'FormulaPreset',

    preset: {
      // Subtract.
      formula: 'Math',
      method: 'minus',
      values: [
        // To mouse position
        {
          formula: 'MousePosition',
          direction: undefined
        },
        // Screen width
        {
          formula: 'Math',
          method: 'divide',
          values: [
            {
              formula: 'SpriteStageSize',
              direction: undefined
            },
            // Divided by 2
            2
          ]
        }
      ]
    },

    scales: {
      X: 'width',
      Y: 'height'
    },

    presetAlter: function (merged, formula) {
      // Set mouse direction.
      merged.values[0].direction = formula.direction;
      // Set stage size.
      merged.values[1].values[0].direction = this.scales[formula.direction];
    }
  });
}(WjsProto));
