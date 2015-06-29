(function (WjsProto) {
  'use strict';
  /**
   * @register JsClass > Formula
   */
  WjsProto.register('JsClass', 'FormulaPreset', {
    classExtends: 'Formula',
    preset: {formula: 'undefined'},

    result: function (formula, options) {
      // Create a new object with preset.
      var merged = this.wjs.extendObject({}, this.preset);
      // Add formula params.
      this.wjs.extendObject(merged, formula);
      // Except formula name.
      merged.formula = this.preset.formula;
      // Let subclasses connect formula params to preset.
      this.presetAlter(merged, formula, options);
      // Execute base preset formula.
      return this.wjs.formula.result(merged, options);
    },

    // To override...
    presetAlter: WjsProto._e
  });
}(WjsProto));
