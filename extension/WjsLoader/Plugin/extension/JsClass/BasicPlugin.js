(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicPlugin', {
    type: 'Plugin',
    classExtends: 'BasicBinder',

    variables: {
      binderType: 'Binder',
      dom: false,
      binders: {}
    },

    options: {
      binder: {
        defaults: null,
        define: function (value) {
          if (value) {
            this.binderAdd(value);
          }
          return value;
        }
      }
    },

    // Methods are attached to binder.
    overrides: {
      variables: {},
      methods: {}
    },

    backups: {
      variables: {},
      methods: {}
    },

    // List of require plugins
    required: [],

    /**
     * @require JsMethod > inheritMethodLinage
     * @require JsMethod > inheritObject
     */
    __construct: function () {
      // Add required plugins.
      this.required = this.wjs.inheritObject(this, 'required', true);
      this.wjs.inheritMethod(this, '__construct', arguments);
      this.pluginInit();
    },

    __destruct: function () {
      // Detach all methods of plugins on binder.
      var i = 0, key, keys = Object.keys(this.methods);
      while (key = keys[i++]) {
        if (key !== 'variables') {
          delete this.binder[key];
        }
      }
      this.wjs.inheritMethod(this, '__destruct', arguments);
    },

    binderAdd: function (binder) {
      if (!binder || !binder.isA(this.binderType)) {
        this.error('Binder type ' + binder.typeGlobal +
          ' not allowed for plugin ' + this.type +
          ', expected ' + this.binderType);
      }
      // First add requirements.
      // Check if any plugin of each type, included
      // extended plugins, is present.
      var i = 0, j, key, keys = Object.keys(this.required), plugin, requiredFiltered = [];
      while (key = keys[i++]) {
        if (binder.pluginsList.length === 0) {
          requiredFiltered.push(this.required[key]);
        }
        else {
          for (j = 0; plugin = binder.pluginsList[j++];) {
            if (!plugin.isA(this.required[key].type)) {
              requiredFiltered.push(this.required[key]);
            }
          }
        }
      }
      binder.pluginAddMultiple(requiredFiltered, undefined, true);
      this.binders[binder.id] = binder;
      // Attach all methods of plugins on binder.
      // Method are quite simple, no inheritance allowed (no __base method),
      // methods list is inherited for parent plugin to children,
      // methods with the same name are overridden.
      if (this.overrides) {
        this.overrides = this.wjs.inheritObject(this, 'overrides');
        var methods = this.overrides.methods;
        keys = Object.keys(methods);
        // Backup.
        this.backups.methods[binder.id] = this.backups.methods[binder.id] || {};
        // Methods.
        i = 0;
        while (key = keys[i++]) {
          this.backups.methods[binder.id][key] = binder[key];
          // Create a __base method.
          binder[key] = this.wjs.inheritMethodLinage(binder, binder[key], methods[key], [this]);
        }
        // Variables.
        if (this.overrides.variables) {
          keys = Object.keys(this.overrides.variables);
          this.backups.variables[binder.id] = this.backups.variables[binder.id] || {};
          // Backup.
          for (i = 0; key = keys[i++];) {
            this.backups.variables[binder.id][key] = binder[key];
          }
          binder.variableInitMultiple(this.overrides.variables);
        }
      }
      this.binderInit(binder);
    },

    binderRemove: function (binder) {
      this.binderExit(binder);
      binder.pluginRemoveMultiple(this.required);
      if (this.overrides) {
        var methods = this.overrides.methods,
          i = 0, key, keys = Object.keys(methods);
        // Methods.
        while (key = keys[i++]) {
          if (this.backups.methods[binder.id] && this.backups.methods[binder.id][key]) {
            binder[key] = this.backups.methods[binder.id][key];
            delete this.backups.methods[binder.id][key];
          }
        }
        delete this.backups.methods[binder.id];
        // Variables.
        if (this.overrides.variables && this.overrides.variables[binder.id]) {
          keys = Object.keys(this.overrides.variables);
          // Rollback.
          for (i = 0; key = keys[i++];) {
            binder[key] = this.backups.variables[binder.id][key];
          }
          delete this.backups.variables[binder.id];
        }
      }
      delete this.binders[binder.id];
    },

    binderInit: function (binder) {
      // To override...
    },

    binderExit: function (binder) {
      // To override...
    },

    pluginInit: function () {
      // To override...
    },

    bindersCall: function (method, args) {
      this.bindersEach(args ? function (binder) {
        // Apply args.
        binder.apply(method, args);
      } : function (binder) {
        // Just call (faster).
        binder[method]();
      });
    },

    bindersEach: function (callback) {
      var i = 0, keys = Object.keys(this.binders), key;
      while (key = keys[i++]) {
        callback(this.binders[key]);
      }
    }
  });
}(WjsProto));
