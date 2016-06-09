(function (W) {
  'use strict';
  W.register('WebComScheme', 'SchemePlugin', {
    classExtends: 'Binder',
    type: 'Plugin',

    variables: {
      elementType: 'Element',
      dom: false,
      element: {},
      backups: {
        variables: {},
        add: {}
      }
    },

    options: {
      element: {
        defaults: null,
        define: function (com, value) {
          value && this.elementAppend(value);
          return value;
        }
      }
    },

    // Methods are attached to element.
    elementVariablesList: {},

    alterList: {},

    // List of require plugins
    required: [],

    /**
     * @require JsMethod > inheritMethodLinage
     * @require JsMethod > inheritObject
     */
    __construct: function (options) {
      // Add required plugins TODO IN PROTO.
      this.required = this.w.inheritObject(this, 'required', true);
      // Base construction.
      this.__super('__construct', arguments);
    },

    __destruct: function () {
      // User friendly
      this.exitPlugin();
      // Super.
      this.__super('__destruct', arguments);
    },

    elementAppend: function (element) {
      if (!element || !element.isA(this.elementType)) {
        this.error('element type ' + element.typeGlobal +
          ' not allowed for plugin ' + this.type +
          ', expected ' + this.elementType);
      }
      // Use callback from listened element
      // for formula attached to current variables.
      this.formulaChangeCallback = element.formulaChangeCallback;
      // First add requirements.
      // Check if any plugin of each type, included
      // extended plugins, is present.
      var i = 0, j, key, keys = Object.keys(this.required), plugin, requiredFiltered = [];
      while (key = keys[i++]) {
        if (element.pluginsList.length === 0) {
          requiredFiltered.push(this.required[key]);
        }
        else {
          for (j = 0; plugin = element.pluginsList[j++];) {
            if (!plugin.isA(this.required[key].type)) {
              requiredFiltered.push(this.required[key]);
            }
          }
        }
      }
      element.pluginAddMultiple(requiredFiltered, undefined, true);
      this.element = element;
    },

    elementRemove: function () {
      delete this.element;
      this.exit();
    },

    // To override.
    init: W._e,

    // To override.
    exit: W._e
  });
}(W));
