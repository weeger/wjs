/**
 * Base class for WebComp elements.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WebComScheme', 'SchemeElement', {
    classExtends: 'Binder',
    type: 'Element',

    variables: {
      parent: null,
      children: [],
      listeners: {},
      plugins: {},
      pluginsList: [],
      pluginMethods: {},
      pluginSharedMethod: null,
      pluginSharedQueue: null,
      pluginSharedMethodCallback: null,
      frameNextEnabled: false,
      global: false,
      globalParents: {},
      playFrameStamp: 0,
      formulaVarListenersCounter: {}
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
        define: function (com, value, options) {
          if (value) {
            com.optionApply('parent', options);
            // Use itself as player if true.
            if (value === true) {
              value = com;
            }
            else if (value === null && com.parent !== null && com.parent.playPlayer !== null) {
              value = com.parent.playPlayer;
            }
            com.stateSet('playing', value.playStarte);
          }
          return value;
        }
      },
      autoPlay: {
        defaults: false,
        define: function (com, value) {
          if (value) {
            com.play();
          }
        },
        dump: true
      },
      children: {
        define: function (com, value) {
          var output = [];
          if (typeof value === 'object') {
            var keys = Object.keys(value), i = 0, options;
            while (options = value[keys[i++]]) {
              // Options, object is extended to break the link
              // between sent object and optionsDefaults parent reference.
              options = com.wjs.extendObject({}, options);
              // Create child.
              output.push(com.childAdd(options));
            }
          }
          return output;
        }
      },
      parentShortcut: {
        defaults: false,
        define: function (com, value) {
          // Define a shortcut for parent to
          // access to his child.
          if (value && com.parent) {
            com.parent[value] = com;
          }
        }
      },
      plugins: {
        defaults: [],
        define: function (com, value) {
          com.pluginAddMultiple(value);
          return undefined;
        },
        // Special method is used to dump plugins.
        dump: []
      },
      parent: {
        defaults: null,
        define: function (com, value) {
          // Only Element can have children.
          if (value && value.isA('Element')) {
            value.elementAppend(com);
          }
        },
        destroy: function (com) {
          // Remove from parent.
          if (com.parent !== null) {
            com.parent.elementRemove(com);
          }
        }
      }
    },

    states: {
      playing: false,
      renderEnabled: true
    },

    __construct: function (options) {
      // Build callback for frame playing.
      this.playFrameExecuteProxy = this.playFrameExecute.bind(this);
      // Callback for listeners.
      this.playFrameNextEnableProxy = this.frameNextEnable.bind(this);
      // Base.
      this.__super('__construct', arguments);
      // Render element.
      this.render();
    },

    /**
     * Advanced variable setter, detect formulas.
     */
    variableSet: function (name, value) {
      // Remove listener for old value.
      if (this[name] && this[name].formula) {
        // Enable
        // TODO Forget
//        this.wjs.window.removeEventListener(value.eventNameUpdate, this.playFrameNextEnableProxy);

      }
      // Set new listener if formula.
      if (value && value.formula) {
//        this.formulaListen(value);

        if (this.wjs.formula.formulas[value.formula].preset) {
          this.formulaListen(this.wjs.formula.formulas[value.formula].preset);
        }
      }
      // Use protected inheritance.
      this.__super('variableSet', arguments);
    },

    formulaListen: function (formula) {
      var self = this;
      this.formulaInspectEvent(formula, function (formula) {
        var formulaName = formula.formula, counter = self.formulaVarListenersCounter;
        // Listen only once for each formula type.
        if (!counter[formulaName]) {
          self.wjs.window.addEventListener(formula.eventNameUpdate, self.playFrameNextEnableProxy);
        }
        // Count.
        counter[formulaName] = counter[formulaName] || 0;
        counter[formulaName]++;
      });
    },

    formulaInspectEvent: function (formula, callback) {
      var self = this;
      this.objectInspect(formula, function (item) {
        // Item is a formula / sub formula.
        if (item && item.formula) {
          var formulaName = item.formula,
            formula = self.wjs.formula.formulas[formulaName];
          // Formula exists and is an event trigger.
          if (formula && formula.eventTrigger) {
            callback(formula);
          }
        }
      });
    },
// TODO this.wjs FOR THIS METHOD
    objectInspect: function (object, callback, level) {
      level = level || 0;
      for (var keys = Object.keys(object), i = 0, item, result; item = keys[i++];) {
        result = callback(object[item], item, level);
        // Recursive, if no "false" returned.
        if (result !== false &&
          // On non null objects.
          typeof object[item] === 'object' && object[item]) {
          this.objectInspect(object[item], callback, level + 1);
        }
        // Continue if no "null" returned.
        if (result === null) {
          return;
        }
      }
    },

    exit: function (callback) {
      var self = this,
        args = arguments;
      self.stop();
      // Remove all plugins.
      self.pluginsClear();
      // Remove all children.
      self.empty(function () {
        // Execute inherited exit.
        self.__super('exit', args);
      });
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

    // To override...
    globalChildAppend: WjsProto._e,

    // To override...
    globalChildRemove: WjsProto._e,

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
        plugin = wjs.loaders.Plugin.instance(name, options);
      }
      // Init binder.
      plugin.elementAdd(this);
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
      plugin.elementRemove(this);
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

    pluginsInvoke: function (hook, data) {
      // First render plugins, keep list order.
      var i = 0, plugin;
      while (plugin = this.pluginsList[i++]) {
        if (typeof plugin[hook] === 'function') {
          plugin[hook](this, data);
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
        (!player || player === this.playPlayer || this.playerPropagate === true)) {
        // Create render data object shared
        // with other render instances.
        var renderData = this.renderReset();
        // Ask direct parent rendering.
        if (this.parent) {
          this.parent.renderChild(this, renderData);
        }
        this.pluginsInvoke('renderDom', renderData);
        // Apply to element.
        this.renderDom(renderData);
        // Propagate to children.
        this.renderChildren();
      }
    },

    renderReset: function () {
      return {};
    },

    // To override...
    // No automated application for styles.
    renderDom: WjsProto._e,

    renderChildren: function (player) {
      for (var i = 0, child; child = this.children[i++];) {
        // Init children.
        child.render(player);
      }
    },

    // To override... (child, renderData)
    // No automated application for styles.
    renderChild: WjsProto._e,

    empty: function (callback) {
      this.emptyNext(callback);
    },

    emptyNext: function (completeCallback) {
      var self = this;
      if (this.children.length) {
        this.children[0].exit(function () {
          self.emptyNext(completeCallback);
        });
        return;
      }
      this.emptyComplete(completeCallback);
    },

    emptyComplete: function (callback) {
      callback();
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
        this.stateSet('playing', true);
      }
    },

    playStateQuit: function (playPlayer) {
      if (playPlayer === this.playPlayer) {
        this.stateSet('playing', false);
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
        this.wjs.window.setTimeout(this.playFrameExecuteProxy,
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
    },

    result: function (formula) {
      return this.wjs.formula.result(formula, this);
    }
  });
}(WjsProto));
