/**
 * Base class for WebComp elements.
 * @require JsClass > BezierEasing
 */
(function (W) {
  'use strict';
  W.register('WebComScheme', 'SchemeElement', {
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
      playFrameStamp: 0,
      animations: [],
      domBoundingClientRect: false,
      readyRan: false,
      readyCallbacks: []
    },

    options: {
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
              // TODO Create a playPlayerSet method.
              com.playPlayerOptions = {details: [com]};
            }
            else if (value === null && com.parent && com.parent.playPlayer !== null) {
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
            com.ready(function () {
              com.play();
            });
          }
        },
        dump: true
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
        defaults: {},
        define: function (com, value) {
          this.plugins = {};
          com.pluginAddMultiple(value);
          return com.plugins;
        },
        // Special method is used to dump plugins.
        dump: []
      },
      parent: {
        defaults: undefined,
        define: function (com, value) {
          // Only Element can have parent / children.
          if (value && value.isA('Element')) {
            value.elementAppend(com);
          }
        },
        destroy: function (com) {
          // Remove from parent.
          if (com.parent) {
            com.parent.elementRemove(com);
          }
        }
      },
      children: {
        // Children are created manually
        // at the full end of object creation
        // it is not really a part of construction.
        autoInit: false,
        define: function (com, value) {
          var output = [];
          if (typeof value === 'object') {
            var keys = Object.keys(value), i = 0, options;
            while (options = value[keys[i++]]) {
              // Options, object is extended to break the link
              // between sent object and optionsDefaults parent reference.
              options = com.w.extendObject({}, options);
              // Create child.
              output.push(com.childAdd(options));
            }
          }
          return output;
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
      // Define frame enable as callback
      // when a formula variable change.
      this.formulaChangeCallback = this.frameNextEnable.bind(this);
      // Base.
      this.__super('__construct', arguments);
    },

    ready: function (callback) {
      !this.readyRan ? this.readyCallbacks.push(callback) : callback();
    },

    readyComplete: function () {
      if (!this.readyRan) {
        this.parent && this.parent.readyComplete();
        // Execute all callbacks.
        this.w.callbacks(this.readyCallbacks, undefined, this);
        // Empty array
        this.readyCallbacks = [];
        // Prevent further executions.
        this.readyRan = true;
      }
    },

    init: function () {
      // Display dom.
      this.__super('init', arguments);
      // Children should be created on construct complete.
      this.optionApply('children');
      // Render element.
      this.render();
      // Launch callbacks.
      this.readyComplete();
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

    createInstance: function (type, name, options) {
      options = options || {};
      options.parent = this;
      return this.__super('createInstance', [type, name, options]);
    },

    /**
     * Create a binder, set this as parent.
     */
    childAdd: function (options) {
      var w = this.w, split;
      // Parse type string, format loader::type.
      split = options.type ? options.type.split('::') : ['Element', false];
      // Type is no more used.
      delete options.type;
      // Attach parent.
      options.parent = this;
      // Create instance, all constructors must exist.
      return w.loaders[split[0]].instance(split[1], options);
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
      // Add to children.
      this.children.push(element);
      // Save parent reference.
      element.parent = this;
    },

    elementAppendTo: function (parent) {
      parent.elementAppend(this);
    },

    /**
     * @require JsMethod > arrayDeleteItem
     */
    elementRemove: function (element) {
      this.w.arrayDeleteItem(this.children, element);
      element.parent = null;
    },

    domParseInclude: function (options) {
      options = options || {};
      // Define current active element
      // as parent of all found child elements.
      options.parent = this;
      return this.__super('domParseInclude', [options]);
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
        // Callback can be a function or a method name.
        (isFunction ? callback : child[callback]).apply(child, args);
      }
    },

    /**
     * Add a plugin.
     * Plugin should have been preprocessed.
     */
    pluginAdd: function (name, options, callback) {
      var w = this.w,
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
        plugin = w.loaders.Plugin.instance(name, options);
      }
      // Init binder.
      plugin.elementAppend(this);
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

    pluginAddMultiple: function (value, globalOptions, addOnce) {
      var i = 0, name, options;
      while (options = value[i++]) {
        // Check unique.
        if (!addOnce || !this.pluginGet(options.type)) {
          // Add options for all plugins.
          if (globalOptions) {
            this.w.extendObject(options, globalOptions);
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
      this.w.arrayDeleteItem(plugins[plugin.type], plugin);
      this.w.arrayDeleteItem(this.pluginsList, plugin);
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
          // is still authorized. TODO check if still needed (ex: multiple async players)
        (!player || player === this.playPlayer || this.playerPropagate === true)) {
        // Compute once by render process.
        this.domBoundingClientRect = this.dom ? this.dom.getBoundingClientRect() : false;
        // Animation can update data
        this.renderAnimations();
        // Create render data object shared
        // with other render instances.
        var renderData = this.renderReset();
        // Render via plugins.
        this.pluginsInvoke('renderDom', renderData);
        // Apply to element.
        this.renderDom(renderData);
        // Propagate to children.
        this.renderChildren();
        // Player trigger an event on dom tree.
        if (this.playPlayer === this && this.dom) {
          this.w.trigger('playPlayerRender', this.playPlayerOptions, this.dom);
        }
      }
    },

    renderReset: function () {
      return {};
    },

    renderAnimations: function () {
      for (var i = 0, animation; animation = this.animations[i];) {
        i = this.renderAnimation(i, animation);
      }
      if (this.animations.length) {
        this.frameNextEnable();
      }
    },

    renderAnimation: function (animationIndex, animation) {
      var timeRemain = animation.options.timeEnd - (new Date()).getTime(),
        percent = 1 - (timeRemain / animation.options.duration), i = 0, key, percentEase;

      while (key = animation.keys[i++]) {
        percentEase = animation.options.easing ? animation.options.easing.value(percent) : percent;
        this[key] = (animation.original[key] + (animation.add[key] * percentEase));
      }

      if (timeRemain < this.playPlayer.playFrameNext) {
        if (animation.options.complete) {
          animation.options.complete();
        }
        this.w.arrayDeleteByIndex(this.animations, animationIndex);
        return animationIndex;
      }
      return ++animationIndex;
    },

    // To override...
    // No automated application for styles.
    renderDom: W._e,

    renderChildren: function (player) {
      for (var i = 0, child; child = this.children[i++];) {
        // Use an override method.
        this.renderChild(child, player);
      }
    },

    renderChild: function (element, player) {
      element.render(player);
    },

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
      this.trigger('playStopped', [this]);
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
      // Get the expected stamp of the next frame
      this.playFrameNext = (((this.playFrameCurrent + 1) * (1000 / this.fps)) + this.playStampStart) - this.playFrameStamp;
      this.render();
    },

    playFrameNextLaunch: function () {
      if (this.frameNextEnabled) {
        // Launch next frame.
        this.w.window.setTimeout(this.playFrameExecuteProxy, this.playFrameNext);
      }
    },

    animate: function (properties, options) {
      // Convert numeric to object.
      options = typeof options === 'object' ? options : {duration: options};
      // Convert other format to object with complete callback.
      options = this.w.extendOptions(options);
      // Save start stamp.
      options.timeStart = (new Date()).getTime();
      // Save stop stamp.
      options.timeEnd = options.timeStart + options.duration;
      // Build base animation object.
      var animation = {
        keys: Object.keys(properties),
        properties: properties,
        original: {},
        add: {},
        options: options
      }, i = 0, key;
      // Add properties.
      while (key = animation.keys[i++]) {
        // Create a local copy of original states.
        animation.original[key] = this[key];
        // Save value to add.
        animation.add[key] = properties[key] - this[key];
      }
      // Create easing.
      if (options.easing) {
        options.easing = new (this.w.classProto('BezierEasing'))(
          options.easing[0],
          options.easing[1],
          options.easing[2],
          options.easing[3]
        );
      }
      // Append to animation list.
      this.animations.push(animation);
      // Start animation.
      this.play();
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
}(W));
