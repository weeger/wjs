/**
 * Base class for WebComp elements.
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
      pluginsList: [],
      frameNextEnabled: false,
      global: false,
      globalParents: {},
      playFrameStamp: 0,
      playFrameExecuteProxy: null
    },

    options: {
      global: {
        defaults: false
      },
      fps: {
        defaults: 24,
        apply: true,
        dump: true
      },
      playPlayer: {
        defaults: null,
        define: function (value) {
          if (value) {
            this.playPlayer = value;
            // Use itself as player if true.
            if (this.playPlayer === true) {
              this.playPlayer = this;
            }
            else if (this.playPlayer === null && this.parent !== null && this.parent.playPlayer !== null) {
              this.playPlayer = this.parent.playPlayer;
            }
            if (this.playPlayer.playStarted === true) {
              this.stateSet('playing');
            }
          }
        }
      },
      autoPlay: {
        defaults: false,
        define: function (value) {
          if (value) {
            this.play();
          }
        },
        dump: true
      },
      children: {
        define: function (value) {
          if (typeof value === 'object') {
            var keys = Object.keys(value), i = 0, options;
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
      },
      plugins: {
        defaults: [],
        define: function (value) {
          this.pluginAddMultiple(value);
        },
        // Special method is used to dump plugins.
        dump: []
      },
      parent: {
        defaults: null,
        define: function (value) {
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
      }
    },

    states: {
      renderEnabled: true
    },

    __construct: function (options) {
      this.wjs.inheritMethod(this, '__construct', arguments);
      // Build callback for frame playing.
      this.playFrameExecuteProxy = this.playFrameExecute.bind(this);
      // Render element.
      this.render();
    },

    exit: function () {
      this.stop();
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
     * Append child element to this one.
     */
    elementAppend: function (element) {
      // Remove old parent if exists.
      // If parent is the same, remove and re append it.
      if (element.parent) {
        element.parent.elementRemove(element);
      }
      // Append dom if both have one.
      if (this.dom && element.dom) {
        this.dom.appendChild(element.dom);
      }
      // Add to children.
      this.children.push(element);
      // Copy global parents list.
      this.wjs.extendObject(element.globalParents, this.globalParents);
      // Add itself if global
      if (this.global) {
        element.globalParents[this.id] = this;
      }
      // Save parent reference.
      element.parent = this;
      // Invoke globals
      var keys = Object.keys(element.globalParents), key, i = 0;
      while (key = keys[i++]) {
        element.globalParents[key].globalChildAppend(element);
      }
    },

    elementAppendTo: function (parent) {
      parent.elementAppend(this);
    },

    /**
     * @require JsMethod > arrayDeleteItem
     */
    elementRemove: function (element) {
      // Invoke globals
      var keys = Object.keys(element.globalParents), key, i = 0;
      while (key = keys[i++]) {
        element.globalParents[key].globalChildRemove(element);
      }
      this.wjs.arrayDeleteItem(this.children, element);
      element.parent = null;
      // Remove all global parents references.
      element.globalParents = {};
    },

    globalChildAppend: function (element) {
      // To override...
    },

    globalChildRemove: function (element) {
      // To override...
    },

    treeMap: function (callback, args) {
      // Search for function.
      var callbackFunction = (typeof callback === 'string') ? this[callback] : callback;
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
      // A plugin instance can be sent.
      if (typeof name === 'object') {
        plugin = name;
        callback = options;
        name = name.type;
      }
      else {
        // Create plugin.
        plugin = wjs.loaders.Plugin.instanceOnce(name, options);
      }
      // Init binder.
      plugin.binderAdd(this);
      // Save it.
      plugins[name] = plugins[name] || [];
      // Push plugin.
      plugins[name].push(plugin);
      pluginsList.push(plugin);
      // Update rendering.
      this.render();
      if (callback) {
        callback(plugin);
      }
      return plugin;
    },

    pluginAddMultiple: function (value, globalOptions, addOnce) {
      var i = 0, name, options;
      while (options = value[i++]) {
        // Check unique.
        if (!addOnce || !this.pluginGet(options.type)) {
          // Add options for all plugins.
          if (globalOptions) {
            this.wjs.extendObject(options, globalOptions);
          }
          // Manage case of already created plugins objects.
          if (options.isA && options.isA('Plugin')) {
            name = options;
            options = undefined;
          }
          else {
            name = options.type;
          }
          // Add
          this.pluginAdd(name, options);
        }
      }
    },

    pluginRemoveMultiple: function (value) {
      var i = 0, type;
      while (type = value[i++]) {
        // Allow options list.
        type = type.type || type;
        if (this.pluginGet(type)) {
          this.pluginRemove(type);
        }
      }
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
      plugin.binderRemove(this);
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
        // Ask direct parent rendering.
        if (this.parent) {
          this.parent.renderChild(this, renderData);
        }
        // Apply to element.
        this.renderDom(renderData);
        // Propagate to children.
        this.renderChildren();
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
      var i = 0, child;
      while (child = this.children[i++]) {
        // Init children.
        child.render(player);
      }
    },

    renderChild: function (child, renderData) {
      // To override
    },

    empty: function () {
      while (this.children.length > 0) {
        this.children[0].exit();
      }
    },

    play: function () {
      this.playStarted = true;
      // Set it as player for all elements tree.
      this.treeMap('playStateStart', [this]);
      // Save start timestamp, this stamp
      // is used as a base to calculate all next
      // frames : animation is based on real time.
      this.playStampStart = new Date().getTime();
      // Enable at least first frame rendering.
      this.frameNextEnable();
      // Play current frame.
      this.playFrameExecute();
      this.trigger('playStarted', [this]);
    },

    stop: function () {
      this.treeMap('playStateQuit', [this]);
      this.playStarted = false;
      this.trigger('play_stopped', [this]);
    },

    playStateStart: function (playPlayer) {
      if (playPlayer === this.playPlayer) {
        this.stateSet('playing');
        var i;
        for (i in this.pluginsList) {
          if (this.pluginsList.hasOwnProperty(i)) {
            this.pluginsList[i].stateSet('playing');
          }
        }
      }
    },

    playStateQuit: function (playPlayer) {
      if (playPlayer === this.playPlayer) {
        this.stateQuit('playing');
        var i;
        for (i in this.pluginsList) {
          if (this.pluginsList.hasOwnProperty(i)) {
            this.pluginsList[i].stateQuit('playing');
          }
        }
      }
    },

    /**
     * Return frame number according to timestamp.
     */
    playFrameNumber: function () {
      if (this.playStarted === false) {
        return 0;
      }
      return Math.round(((this.playFrameStamp - this.playStampStart) / 1000) * this.fps);
    },

    playFrameExecute: function () {
      // Empty queue.
      this.frameNextEnabled = false;
      this.playFrameStamp = new Date().getTime();
      this.playFrameCurrent = this.playFrameNumber();
      this.render();
    },

    playFrameNextLaunch: function () {
      if (this.frameNextEnabled) {
        // Launch next frame.
        setTimeout(this.playFrameExecuteProxy,
          // Get the expected stamp of the next frame
          (((this.playFrameCurrent + 1) * (1000 / this.fps)) + this.playStampStart) - this.playFrameStamp
        );
      }
    },

    /**
     * Save element as needing an update
     * on the next frame execution.
     */
    frameNextEnable: function () {
      if (this.frameNextEnabled === false && this.playPlayer !== null && this.playPlayer.playStarted === true) {
        // If a player is defined,
        // and ask for a new render process.
        if (this.playPlayer !== this) {
          this.playPlayer.frameNextEnable();
        }
        else {
          this.frameNextEnabled = true;
          this.playFrameNextLaunch();
        }
      }
    },

    frame: function () {
      this.play();
      this.stop();
    }
  });
}(WjsProto));
