(function (W) {
  'use strict';
  /**
   * @register JsClass > Formula
   */
  W.register('JsClass', 'FormulaPreset', {
    classExtends: 'Formula',
    preset: {formula: 'undefinedBaseFormula'},

    result: function (formula, options) {
      // Create a new object with preset.
      var merged = this.w.extendObject({}, this.preset);
      // Add formula params.
      this.w.extendObject(merged, formula);
      // Except formula name.
      merged.formula = this.preset.formula;
      // Let subclasses connect formula params to preset.
      this.presetAlter(merged, formula, options);
      // Execute base preset formula.
      return this.w.formula.result(merged, options);
    },
    // To override...
    presetAlter: W._e
  });
}(W));
