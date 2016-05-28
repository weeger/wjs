(function (W) {
  'use strict';
  /**
   * @require JsMethod > upperCaseFirstLetter
   */
  W.register('Formula', 'Math', {
    // add / minus / divide / multiply
    method: undefined,
    // Mixed list of values / formulas;
    values: null,

    result: function (formula, options) {
      var i = 0, item, values = [];
      while (item = formula.values[i++]) {
        // Convert sub formulas to numbers.
        values.push(this.wjs.formula.result(item, options));
      }
      return values.reduce(this[formula.method]);
    },

    add: function (previous, current) {
      return previous + current;
    },

    minus: function (previous, current) {
      return previous - current;
    },

    divide: function (previous, current) {
      return previous / current;
    },

    multiply: function (previous, current) {
      return previous * current;
    }
  });
}(W));
