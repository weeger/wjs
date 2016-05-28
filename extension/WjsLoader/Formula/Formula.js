/**
 * @require WjsLoader > JsMethod
 * @require WjsLoader > JsClassStatic
 * @require JsClassStatic > FormulaManager
 */
(function (W) {
  'use strict';
  W.register('WjsLoader', 'Formula', {
    loaderExtends: 'JsClass',
    wjsShortcuts: false,

    __destruct: function () {
      this.wjs.loaders.JsClass.__destruct.call(this);
      // Remove manager.
      this.wjs.destroy('JsClassStatic', 'FormulaManager', true);
    },

    register: function (type, name, process, value) {
      // Add to manager.
      this.wjs.formula.append(name, value || W.retrieve(this.type, name));
      // Skip JsClass inheritance level.
      this.wjs.loaders.JsMethod.register.apply(this, [type, name, process, value]);
    },

    destroy: function (name) {
      // Remove from manager.
      this.wjs.formula.remove(name);
      // Normal destruct.
      return this.wjs.loaders.JsClass.destroy.apply(this, arguments);
    }
  });
}(W));
