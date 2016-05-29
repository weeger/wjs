(function (W) {
  'use strict';
  /**
   * @require JsClass > Formula
   */
  W.register('JsClassStatic', 'FormulaManager', {
    __construct: function () {
      this.formulas = {};
      this.w.formula = this;
    },

    __destruct: function () {
      for (var i = 0, key, keys = Object.keys(this.formulas); key = keys[i++];) {
        this.w.classProtoDestroy(this.className(key));
      }
      delete this.w.formula;
    },

    className: function (name) {
      return 'Formula\\' + name;
    },

    append: function (name, proto) {
      proto.name = name;
      proto.classExtends = proto.classExtends || 'Formula';
      var className = this.className(name);
      // Extend prototype.
      this.w.classExtend(className, proto);
      // One instance by formula class.
      this.formulas[name] = new (this.w.classProto(className))();
    },

    remove: function () {
      // Remove proto.
      this.w.classProtoDestroy('Formula' + name);
      // Remove instance.
      delete this.formulas[name];
    },

    result: function (formula, options) {
      // Formula may be a simple number.
      if (!formula.formula) {
        return formula;
      }
      return this.formulas[formula.formula].result(formula, options);
    }
  });
}(W));
