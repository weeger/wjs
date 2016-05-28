(function (W) {
  'use strict';
  /**
   * @require JsClass > FormulaPreset
   * @require Formula > Math
   * @require Formula > MousePosition
   * @require Formula > ScreenSize
   */
  W.register('Formula', 'MousePositionFromCenter', {
    classExtends: 'FormulaPreset',
    eventTrigger: true,
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
              formula: 'ScreenSize',
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
}(W));
