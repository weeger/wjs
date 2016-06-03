/**
 * Base class for WebComp elements.
 * @require JsScript > SchemeWebCom
 * @require JsMethod > inheritLinage
 */
(function (W) {
  'use strict';
  W.register('WebComScheme', 'SchemeBinder', {
    classExtends: 'WebCom',
    type: 'Binder',

    variables: {
      listeners: {},
      statesVars: {},
      stateConnected: {},
      stateListener: {},
      formulaVarListenersCounter: {}
    },

    states: {},

    options: {
      cssClasses: {
        define: function (com, value) {
          value = value || [];
          if (com.loader.classLists[com.typeGlobal]) {
            // Return list of used classes.
            return value.concat(com.loader.classLists[com.typeGlobal]);
          }
        }
      },
      cssFadeIn: {
        define: function (com, value, options) {
          var i = 0, cssClassNameShortcut, loader = com.loader,
            protoName = loader.protoName(com.type),
            domStyle = loader.domStyle[protoName];
          // There is extra parsed CSS data into an internal tag.
          if (domStyle) {
            // Iterates over.
            while (cssClassNameShortcut = loader.classLists[com.typeGlobal][i++]) {
              // Search for css class names.
              if (com.cssRulesClassSearch(domStyle.sheet, cssClassNameShortcut)) {
                // Ona have been found, we will need global type class.
                com.classLoads.typeGlobal = true;
              }
            }
          }
          // Call base function which search into regular CSS links.
          return this.__super('define', [com, value, options]);
        }
      }
    },

    __construct: function (options) {
      // Bind callbacks for dom.
      if (this.domListeners) {
        for (var i = 0, key, keys = this.domListeners; key = keys[i++];) {
          key = this.methodName('callbacks.domListen.' + key);
          // Bind.
          this[key] = this[key].bind(this);
        }
      }
      // Base method.
      this.__super('__construct', arguments);
      // Inherit callbacks methods.
      this.w.inheritLinage(this, 'states');
    },

    callbackFind: function (callback, group) {
      // Callback is already a function.
      if (typeof callback === 'function') {
        return callback;
      }
      // Callback is a string,
      // search it into callbacks groups.
      else {
        return this.method('callbacks.' + group + '.' + callback);
      }
    },

    domChildFill: function (name, content) {
      // Use parent method.
      this.__super('domChildFill', arguments);
      // Trigger event.
      this.trigger('domChildFill', [name, content]);
    },

    domChildRemove: function (name) {
      var dom = this.domChildGet(name);
      dom.parentNode.removeChild(dom);
    },

    domStyleGet: function (name) {
      return this.w.window.getComputedStyle(this.dom, null).getPropertyValue(name);
    },

    domRect: function () {
      return this.dom.getBoundingClientRect();
    },

    /**
     * Advanced variable setter, detect formulas.
     */
    variableSet: function (name, value) {
      // Remove listener for old value.
      if (value && value.formula) {
        // Disable
        this.formulaListenAll(value, false);
      }
      // Set new listener if formula.
      if (value && value.formula) {
        this.formulaListenAll(value);
      }
      // Use protected inheritance.
      this.__super('variableSet', arguments);
    },

    variableGet: function (name) {
      var value = this.__super('variableGet', arguments);
      if (value !== undefined && value.formula) {
        return this.w.formula.result(value, this);
      }
      // Use protected inheritance.
      return value;
    },

    formulaListenAll: function (formula, toggle) {
      this.objectInspect(formula, this.formulaListen.bind(this), toggle);
    },

    formulaListen: function (item, toggle) {
      // Item is a formula / sub formula.
      if (item && item.formula) {
        var formulaName = item.formula,
          formula = this.w.formula.formulas[formulaName];
        // Formula exists and is an event trigger.
        if (formula && formula.eventTrigger && this.formulaChangeCallback) {
          var counter = this.formulaVarListenersCounter;
          // Remove
          if (toggle === false && counter[formulaName] > 0) {
            // Decrease.
            counter[formulaName]--;
            // All formulas removed.
            if (counter[formulaName] === 0) {
              this.w.window.removeEventListener(formula.eventNameUpdate, this.formulaChangeCallback);
              delete counter[formulaName];
            }
          }
          // Add
          else {
            // Listen only once for each formula type.
            if (!counter[formulaName]) {
              this.w.window.addEventListener(formula.eventNameUpdate, this.formulaChangeCallback);
            }
            // Count.
            counter[formulaName] = counter[formulaName] || 0;
            counter[formulaName]++;
          }
        }
      }
    },

// TODO this.w FOR THIS METHOD
    objectInspect: function (object, callback, args, level) {
      level = level || 0;
      if (typeof object === 'object') {
        var result = callback(object, args, level);
        // Recursive if not null.
        if (result !== null) {
          for (var keys = Object.keys(object), i = 0, key; key = keys[i++];) {
            // Continue if no false;
            if (this.objectInspect(object[key], callback, args, level + 1) === false) {
              return;
            }
          }
        }
        return result;
      }
    },

    stateSet: function (name, value, vars) {
      var previous = this.states[name], callback;
      if (value !== previous) {
        if (!this.states.hasOwnProperty(name)) {
          this.error('Trying to set undefined state ' + name);
        }
        callback = this.callbackFind(name, 'stateSet');
        this.states[name] = value;
        // Save state vars.
        this.statesVars[name] = this.statesVars[name] || {};
        this.w.extendObject(this.statesVars[name], vars || {});
        // Execute internal callback if exists,
        // it avoid binder to listen itself on
        // states changes.
        if (callback) {
          this[this.methodName('callbacks.stateSet.' + name)](value, vars, previous);
        }
        // Trigger event for other binders.
        this.trigger('stateSet', [name, value, previous]);
      }
    },

    stateGet: function (name) {
      return this.states[name];
    },

    stateIs: function (request) {
      if (typeof arguments[0] === 'string') {
        request = {};
        request[arguments[0]] = arguments[1];
      }
      var i = 0, key, keys = Object.keys(request);
      while (key = keys[i++]) {
        if (this.states[key] !== request[key]) {
          return false;
        }
      }
      return true;
    },

    // TODO TEST IT
//    stateVar: function (stateName, varName) {
//      return this.statesVars[stateName][varName];
//    },

    stateListen: function (binder, name, callback, execute) {
      callback = this.callbackFind(callback, 'stateListen');
      this.stateListener[binder.id] = this.stateListener[binder.id] || {};
      this.stateListener[binder.id][name] = callback;
      // Listen once.
      if (Object.keys(this.stateListener[binder.id]).length === 1) {
        this.listen(binder, 'stateSet', 'stateListen');
      }
      if (execute) {
        callback.apply(this, [binder, name, binder.stateGet(name)]);
      }
    },

    stateForget: function (binder, name, callback, execute) {
      var listeners = this.stateListener[binder.id];
      callback = this.callbackFind(callback, 'stateListen');
      // Execute callback one last time before removing
      if (execute) {
        this.callbackFind(callback, 'stateListen').apply(this, [binder, name, binder.stateGet(name)]);
      }
      // Remove entry.
      delete listeners[name];
      if (Object.keys(listeners).length === 0) {
        this.forget(binder, 'stateSet');
      }
    },

    stateConnect: function (binder, name, localState, execute) {
      var stateConnected = this.stateConnected;
      stateConnected[binder.id] = stateConnected[binder.id] || {};
      stateConnected[binder.id][name] = stateConnected[binder.id][name] || [];
      stateConnected[binder.id][name].push(localState);
      this.stateListen(binder, name, this.callbackFind('stateConnect', 'stateListen'), execute);
    },

    /**
     * @require JsMethod > arrayDeleteItem
     */
    stateDisconnect: function (binder, name, localState, execute) {
      var stateConnected = this.stateConnected,
        localStates = stateConnected[binder.id] ? stateConnected[binder.id][name] : undefined;
      if (localStates) {
        this.w.arrayDeleteItem(localStates, localState);
        this.stateForget(binder, name, this.callbackFind('stateConnect', 'stateListen'), execute);
      }
    },

    listen: function (target, eventName, callback) {
      callback = this.callbackFind(callback, 'listen');
      // Get callback function.
      return !!(target.listenerAdd(eventName, this, callback));
    },

    forget: function (target, eventName) {
      return !!(target.listenerRemove(eventName, this));
    },

    hasListener: function (eventName, binder) {
      return (this.listeners[eventName] && this.listeners[eventName][binder.id]);
    },

    listenerAdd: function (eventName, binder, callback) {
      // If exists and not already bind.
      if (!this.hasListener(eventName, binder)) {
        // Record into this.
        // Create entry if not exists.
        this.listeners[eventName] = this.listeners[eventName] || {};
        // Save with binder id.
        this.listeners[eventName][binder.id] = callback;
        return true;
      }
      return false;
    },

    listenerRemove: function (eventName, binder) {
      // If exists and already bind.
      if (this.hasListener(eventName, binder)) {
        // Remove from object.
        delete this.listeners[eventName][binder.id];
        // Delete empty container.
        if (Object.keys(this.listeners[eventName]).length === 0) {
          delete this.listeners[eventName];
        }
      }
    },

    trigger: function (eventName, args) {
      var output = {}, i = 0, listener,
        listeners = this.listeners[eventName] || {},
        key, keys = Object.keys(listeners);
      // Allow missing args.
      args = args || [];
      // Append trigger object at first argument.
      args.unshift(this);
      while (key = keys[i++]) {
        // Listener must still exists and saved into loader
        listener = this.w.loaders.WebCom.webComList[key];
        // But it can disappear during the actual process.
        if (listener) {
          output[listener.id] = listeners[key].apply(listener, args);
        }
      }
      return output;
    },

    domListen: function (domTarget, domEvent, callback) {
      // Handle if domTarget is a node list.
      if (!this.domNodeListMap('domListen', arguments)) {
        domTarget.addEventListener(domEvent, typeof callback === 'function' ? callback : this[this.methodName('callbacks.domListen.' + callback)]);
      }
    },

    domForget: function (domTarget, domEvent, callback) {
      // Handle if domTarget is a node list.
      if (!this.domNodeListMap('domForget', arguments)) {
        domTarget.removeEventListener(domEvent, typeof callback === 'function' ? callback : this[this.methodName('callbacks.domListen.' + callback)]);
      }
    },

    /**
     * Apply an internal function on a node list.
     * Used to be able to execute the same function on
     * one isolated dom node or on a complete node list.
     * Consider first argument of "args" as a NodeList.
     */
    domNodeListMap: function (name, args) {
      var self = this, argsCopy;
      if (args[0] instanceof self.w.window.NodeList) {
        argsCopy = self.w.extendObject([], args);
        // Convert NodeList to array,
        // Then apply function on each item.
        Array.prototype.slice.call(args[0]).map(function (item) {
          argsCopy[0] = item;
          self[name].apply(self, argsCopy);
        }, this);
        return true;
      }
      return false;
    },

    callbacks: {
      listen: {
        /**
         * Called when a state change on the listened object.
         */
        stateListen: function (binder, name, value, previous) {
          var callback = this.stateListener[binder.id] ? this.stateListener[binder.id][name] : undefined;
          // Binder is saved into listened states.
          if (callback) {
            callback.apply(this, [binder, name, value, previous]);
          }
        }
      },
      stateListen: {
        /**
         * Called when a state change on the listened object.
         * Apply the same value to the local state.
         */
        stateConnect: function (binder, name, value) {
          var localStates = this.stateConnected[binder.id] ? this.stateConnected[binder.id][name] : undefined, i = 0, keys, key;
          if (localStates) {
            keys = Object.keys(localStates);
            while (key = keys[i++]) {
              this.stateSet(localStates[key], value);
            }
          }
        }
      }
    }
  });
}(W));
