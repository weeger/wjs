/**
 * Base class for WebComp elements.
 * @require JsClass > BasicWebComp
 * @require JsMethod > inheritMethod
 * @require JsMethod > inheritLinage
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicBinder', {
    classExtends: 'BasicWebComp',
    type: 'Binder',

    variables: {
      cssClasses: null,
      listeners: {},
      statesVars: {},
      stateConnected: {},
      stateListener: {}
    },
    states: {},

    options: {
      // Binder can define css styles
      // without to have a dom element.
      // It overrides web components
      // defaults css classes.
      cssClasses: {
        define: function () {
          // Initialize css classes
          this.cssClasses = this.loader.cssInit(this, true);
        },
        destroy: function () {
          // Remove loader data.
          this.loader.cssInit(this, false);
        }
      }
    },

    __construct: function (options) {
      // Base method.
      this.wjs.inheritMethod(this, '__construct', arguments);
      // Inherit callbacks methods.
      this.wjs.inheritLinage(this, 'callbacks');
      this.wjs.inheritLinage(this, 'states');
      // Once created, we can trigger variables changes
      // by overriding parent's state wrapper.
      this.variableSetWrapper = this._variableSetWrapper;
    },

    callbackFind: function (callback, group) {
      var callbacks = this.callbacks[group];
      // Callback is already a function.
      if (typeof callback === 'function') {
        return callback;
      }
      // Callback is a string,
      // search it into callbacks groups.
      else if (callbacks && callbacks[callback]) {
        return callbacks[callback];
      }
      // Not found.
      return false;
    },

    domChildFill: function (name, content) {
      // Use parent method.
      this.wjs.inheritMethod(this, 'domChildFill', arguments);
      // Trigger event.
      this.trigger('domChildFill', [name, content]);
    },

    domChildRemove: function (name) {
      var dom = this.domChildGet(name);
      dom.parentNode.removeChild(dom);
    },

    domStyleGet: function (name) {
      return this.wjs.window.getComputedStyle(this.dom, null).getPropertyValue(name);
    },

    domRect: function () {
      return this.dom.getBoundingClientRect();
    },

    _variableSetWrapper: function (name, value) {
      this.trigger('variableSet', [name, value]);
      this.wjs.inheritMethod(this, 'variableSetWrapper', arguments);
      var callback = this.callbackFind(name, 'variableSet');
      if (callback) {
        callback(value);
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
        this.wjs.extendObject(this.statesVars[name], vars || {});
        // Execute internal callback if exists,
        // it avoid binder to listen itself on
        // states changes.
        if (callback) {
          callback(value, vars, previous);
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
      var i = 0, keys = Object.keys(request);
      for (; i < keys.length; i++) {
        if (this.states[keys[i]] !== request[keys[i]]) {
          return false;
        }
      }
      return true;
    },

    stateVar: function (stateName, varName) {
      return this.statesVars[stateName][varName];
    },

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
        this.forget(binder, 'stateSet', 'stateListen');
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
        this.wjs.arrayDeleteItem(localStates, localState);
        this.stateForget(binder, name, this.callbackFind('stateConnect', 'stateListen'), execute);
      }
    },

    listen: function (target, eventName, callback) {
      callback = this.callbackFind(callback, 'listen');
      // Get callback function.
      if (target.listenerAdd(eventName, this, callback)) {
        return true;
      }
      return false;
    },

    forget: function (target, eventName) {
      if (target.listenerRemove(eventName, this)) {
        return true;
      }
      return false;
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
        keys = Object.keys(listeners);
      // Allow missing args.
      args = args || [];
      // Append trigger object at first argument.
      args.unshift(this);
      for (; i < keys.length; i++) {
        // Listener must still exists and saved into loader
        listener = this.wjs.loaders.WebComp.webCompList[keys[i]];
        // But it can disappear during the actual process.
        if (listener) {
          output[listener.id] = listeners[keys[i]].apply(listener, args);
        }
      }
      return output;
    },

    domCallbacks: [],
    domCallbacksItems: {},

    domListen: function (domTarget, domEvent, callback) {
      // Handle if domTarget is a node list.
      if (!this.domNodeListMap('domListen', arguments)) {
        callback = this.callbackFind(callback || domEvent, 'domListen');
        domTarget.addEventListener(domEvent, callback);
      }
    },

    domForget: function (domTarget, domEvent, callback) {
      // Handle if domTarget is a node list.
      if (!this.domNodeListMap('domForget', arguments)) {
        callback = this.callbackFind(callback || domEvent, 'domListen');
        domTarget.removeEventListener(domEvent, callback);
      }
    },

    /**
     * Apply an internal function on a node list.
     * Consider first argument of "args" as a NodeList.
     */
    domNodeListMap: function (name, args) {
      var self = this, argsCopy;
      if (args[0] instanceof self.wjs.window.NodeList) {
        argsCopy = self.wjs.extendObject([], args);
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
         * @param binder
         * @param name
         * @param value
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
         * @param binder
         * @param name
         * @param value
         */
        stateConnect: function (binder, name, value) {
          var localStates = this.stateConnected[binder.id] ? this.stateConnected[binder.id][name] : undefined, i = 0, keys;
          if (localStates) {
            keys = Object.keys(localStates);
            for (; i < keys.length; i++) {
              this.stateSet(localStates[keys[i]], value);
            }
          }
        }
      }
    }
  });
}(WjsProto));
