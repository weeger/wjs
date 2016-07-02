/**
 * @require WjsLoader > JsClass
 * @require WjsLoader > JsSingleton
 * @require JsSingleton > FormulaManager
 */
(function (W) {
  'use strict';
  W.register('WjsLoader', 'Formula', {
    loaderExtends: 'JsClass',
    wjsShortcuts: false,

    __destruct: function () {
      // Call super method.
      this.w.loaders.JsClass.__destruct.call(this);
      // Remove manager.
      this.w.destroy('JsSingleton', 'FormulaManager', true);
    },

    register: function (type, name, process, value) {
      // Add to manager.
      this.w.formula.append(name, value || W.retrieve(this.type, name));
      // Skip JsClass inheritance level.
      this.w.loaders.JsMethod.register.apply(this, [type, name, process, value]);
    },

    destroy: function (name) {
      // Remove from manager.
      this.w.formula.remove(name);
      // Normal destruct.
      return this.w.loaders.JsClass.destroy.apply(this, arguments);
    }
  });
}(W));
