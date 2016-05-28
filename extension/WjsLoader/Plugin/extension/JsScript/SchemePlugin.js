(function (W) {
  'use strict';
  W.register('WebComScheme', 'SchemePlugin', {
    classExtends: 'Binder',
    type: 'Plugin',

    variables: {
      elementType: 'Element',
      dom: false,
      elements: {},
      backups: {
        variables: {},
        add: {}
      }
    },

    options: {
      element: {
        defaults: null,
        define: function (com, value) {
          if (value) {
            this.elementAdd(value);
          }
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
      this.required = this.wjs.inheritObject(this, 'required', true);
      // Base construction.
      this.__super('__construct', arguments);
      // User friendly init.
      this.initPlugin(options);
    },

    __destruct: function () {
      // User friendly
      this.exitPlugin();
      // Super.
      this.__super('__destruct', arguments);
    },

    elementAdd: function (element) {
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
      this.elements[element.id] = element;
      this.elementInit(element);
    },

    elementRemove: function (element) {
      this.elementExit(element);
      delete this.elements[element.id];
      if (!Object.keys(this.elements).length) {
        this.exit();
      }
    },

    // To override.
    elementInit: W._e,

    // To override.
    elementExit: W._e,

    // To override.
    initPlugin: W._e,

    // To override.
    exitPlugin: W._e,

    elementsCall: function (method, args) {
      this.elementsEach(args ? function (element) {
        // Apply args.
        element.apply(method, args);
      } : function (element) {
        // Just call (faster).
        element[method]();
      });
    },

    elementsEach: function (callback) {
      var i = 0, keys = Object.keys(this.elements), key;
      while (key = keys[i++]) {
        callback(this.elements[key]);
      }
    }
  });
}(W));
