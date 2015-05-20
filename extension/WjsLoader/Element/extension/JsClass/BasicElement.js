/**
 * Base class for WebComp elements.
 * @require JsClass > BasicBinder
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicElement', {

    type: 'Element',

    classExtends: 'BasicBinder',

    variables: {
      parent: null,
      children: [],
      listeners: {},
      plugins: {},
      pluginsList: []
    },

    options: {
      parent: {
        defaults: null,
        define: function (value, options) {
          // Only Element can have children.
          if (value && value.isA('Element')) {
            value.elementAppend(this);
          }
        },
        destroy: function () {
          // Remove from parent.
          if (this.parent !== null) {
            this.parent.elementRemove(this);
          }
        }
      },
      children: {
        define: function (value) {
          if (typeof value === 'object') {
            var keys = Object.keys(value), i = 0, options, type;
            while (options = value[keys[i++]]) {
              // Options, object is extended to break the link
              // between sent object and optionsDefaults parent reference.
              options = this.wjs.extendObject({}, options);
              // Create child.
              this.childAdd(options);
            }
          }
        }
      },
      parentShortcut: {
        defaults: false,
        define: function (value) {
          // Define a shortcut for parent to
          // access to his child.
          if (value && this.parent) {
            this.parent[value] = this;
          }
        }
      }
    },

    states: {
      renderEnabled: true
    },

    __construct: function (options) {
      this.wjs.inheritMethod(this, '__construct', arguments);
      // Render element.
      this.render();
    },

    exit: function () {
      // Remove all plugins.
      this.pluginsClear();
      // Remove all children.
      this.empty();
      this.wjs.inheritMethod(this, 'exit', arguments);
    },

    /**
     * Create a binder, set this as parent.
     */
    childAdd: function (options) {
      var wjs = this.wjs, split;
      // Parse type string, format loader::type.
      split = options.type ? options.type.split('::') : ['Element', false];
      // Type is no more used.
      delete options.type;
      // Attach parent.
      options.parent = this;
      // Create instance, all constructors must exist.
      return wjs.loaders[split[0]].instance(split[1], options);
    },

    /**
     * Create a new child element.
     */
    elementAdd: function (type, options) {
      options = options || {};
      options.type = 'Element::' + type;
      return this.childAdd(options);
    },

    /**
     * Append child element to this one.
     */
    elementAppend: function (element) {
      // Remove old parent if exists.
      // If parent is the same, remove and re append it.
      if (element.parent) {
        element.parent.elementRemove(element);
      }
      // Append dom if both have one.
      if (this.dom && element.dom && !element.dom.parentNode) {
        this.dom.appendChild(element.dom);
      }
      this.children.push(element);
      element.parent = this;
    },

    elementAppendTo: function (parent) {
      parent.elementAppend(this);
    },

    /**
     * @require JsMethod > arrayDeleteItem
     */
    elementRemove: function (element) {
      this.wjs.arrayDeleteItem(this.children, element);
      element.parent = null;
      // Triggered event.
      this.trigger('elementRemove', [element]);
    },

    treeMap: function (callback, args) {
      // Search for function.
      var i = 0, callbackFunction = (typeof callback === 'string') ? this[callback] : callback;
      // Apply on all children.
      this.childrenMap('treeMap', arguments);
      // Call.
      callbackFunction.apply(this, args);
    },

    childrenMap: function (callback, args) {
      var i = 0, child, isFunction = typeof callback === 'function';
      // Call children, using original argument.
      while (child = this.children[i++]) {
        if (isFunction) {
          callback.apply(child, args);
        }
        else {
          child[callback].apply(child, args);
        }
      }
    },

    /**
     * Add a plugin.
     * Plugin should have been preloaded.
     */
    pluginAdd: function (name, options, callback) {
      var wjs = this.wjs,
        plugins = this.plugins, plugin,
        pluginsList = this.pluginsList;
      // Add reference.
      options = wjs.extendOptions(options, {
        binder: this
      });
      // Create plugin.
      plugin = wjs.loaders.Plugin.instance(name, options);
      // Save it.
      plugins[name] = plugins[name] || [];
      // Push plugin.
      plugins[name].push(plugin);
      pluginsList.push(plugin);
      if (callback) {
        callback(plugin);
      }
      return plugin;
    },

    pluginGet: function (pluginName) {
      if (this.plugins[pluginName]) {
        // If only one item return it.
        if (this.plugins[pluginName].length === 1) {
          return this.plugins[pluginName][0];
        }
        // Or return full array.
        return this.plugins[pluginName];
      }
      return false;
    },

    /**
     * Remove plugin.
     */
    pluginRemove: function (plugin) {
      var i, output = {}, plugins = this.plugins, item;
      // Plugin can be a string.
      if (typeof plugin === 'string') {
        // Plugin may be equal to false if already deleted.
        return this.pluginRemove(this.pluginGet(plugin));
      }
      // Else plugin can be an array of plugins objects.
      if (plugin instanceof Array) {
        for (i = 0; item = plugins[i++];) {
          output[i] = this.pluginRemove(item);
        }
        return output;
      }
      // Kill plugin.
      plugin.exit();
      // Cleanup.
      this.wjs.arrayDeleteItem(plugins[plugin.type], plugin);
      this.wjs.arrayDeleteItem(this.pluginsList, plugin);
      if (Object.keys(plugins[plugin.type]).length === 0) {
        delete plugins[plugin.type];
      }
    },

    pluginsClear: function () {
      // Remove all plugins.
      for (var i = 0, item; item = this.pluginsList[i++];) {
        this.pluginRemove(item);
      }
    },

    pluginsHook: function (hook, data) {
      // First render plugins, keep list order.
      var i = 0, plugin;
      while (plugin = this.pluginsList[i++]) {
        if (typeof plugin[hook] === 'function') {
          plugin[hook](data);
        }
      }
    },

    /**
     * Into render process element can change his own properties
     * or children properties but it must never change
     * parent properties or update it, to avoid recursion.
     */
    render: function (player) {
      if (this.stateGet('renderEnabled') === true &&
        // Block plays if player is not one attached
        // to this sprite, and this one does not allow propagation
        // from an external player. Render with no player defined
        // is still authorized.
        (!player || player === this.player || this.playerPropagate === true)) {
        // Create render data object shared
        // with other render instances.
        var renderData = this.renderReset();
        this.renderDom(renderData);
        // Propagate to children.
        this.renderChildren();
        // Post process
        this.pluginsHook('renderPostprocess', renderData);
        // Propagate.
        this.trigger('render', [renderData]);
      }
    },

    renderReset: function () {
      // Contain render data.
      return {};
    },

    renderDom: function (renderData) {
      // To override...
      // No automated application for styles.
    },

    renderChildren: function (player) {
      for (var i = 0; i < this.children.length; i++) {
        // Init children.
        this.children[i].render(player);
      }
    },

    empty: function () {
      while (this.children.length > 0) {
        this.children[0].exit();
      }
    }
  });
}(WjsProto));
