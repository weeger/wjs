// wJs v3.3.10 - (c) Romain WEEGER 2010 / 2015 - www.wexample.com | MIT and GPL licenses
(function (context) {
  'use strict';
  // <--]
  var wjsVersion = '3.3.10', WJSProto;
  // Protect against multiple declaration.
  // Only one instance of this object is created per page.
  // Contain global javascript tools and helpers functions.
  if (context.wjs !== undefined && context.wjs.version === wjsVersion) {
    return;
  }

  /** @constructor */
  WJSProto = function () {
    var self = this;
    self.extendObject(self, {
      context: context,
      window: context.window || window,
      document: context.document || window.document,
      /** @type {string} */
      version: wjsVersion,
      /** @type {Array.Function} */
      readyCallbacks: [],
      /** @type {boolean} */
      readyComplete: false,
      /** @type {Object} */
      packageDefault: null,
      /** @type {Object.Object} */
      loaders: {},
      /** @type {Array.string} */
      loadersExtra: [],
      /** @type {Array.string} */
      loadersBasic: [],
      /** @type {Object.Object.?} */
      extLoaded: {WjsLoader: {}},
      /** @type {Object.Array.string} */
      extRequire: {},
      /** @type {WJSProcessProto} Reference to prototype */
      processProto: null,
      /** @type {Array.WJSProcessProto} */
      processes: [],
      /** @type {Number} */
      processCounter: 0,
      /** @type {Array} */
      processStack: [],
      /** @type {Array} */
      processParent: undefined,
      /** @type {Object.Function} */
      classProtos: {},
      /** @type {Object.Object} */
      classMethods: {},
      /** @type {Object.Object} */
      cacheBuffer: {},
      /** @type {Object.string} Store names of CacheLinks */
      cacheReg: {},
      /** @type {Object} */
      settings: null
    });
    // Add a global wjsContext, use
    // by scripts links to access to wjs.
    self.context.wjsContext = context;
  };

  WJSProto.prototype = {

    /**
     * Create basics elements to interact with the document.
     * Must be executed when document is ready.
     */
    init: function (options) {
      var self = this;
      self.window.addEventListener('load', function () {
        // Apply options.
        self.extendObject(self, options);
        // Create basic loaders who are required by package.
        for (var i = 0; i < self.loadersBasic.length; i++) {
          self.loaderAdd(self.loadersBasic[i], undefined, true);
        }
        // Mark as readyComplete, further ready functions
        // will be executed directly.
        self.readyComplete = true;
        // Load all other scripts then run ready functions.
        // Create a loading process to parse package content.
        new self.processProto(null, {
          complete: function () {
            delete self.packageDefault;
            self.callbacks(self.readyCallbacks);
          }
          // Directly treat object as response.
        }).responseParse(self.packageDefault);
      });
    },

    /**
     * Because w must execute loading request on startup,
     * he needs his own ready function.
     * @param {function(...)} callback Function executed on loading complete.
     */
    ready: function (callback) {
      if (this.readyComplete === true) {
        // Execute callback asynchronously.
        // IE need function wrap.
        this.window.setTimeout(function () {
          callback();
        });
      }
      else {
        this.readyCallbacks.push(callback);
      }
    },

    /**
     * Place a call to a method after wjs ready.
     * @param method
     * @param args
     * @returns {boolean}
     */
    readyDelay: function (method, args) {
      var self = this;
      if (self.readyComplete !== true) {
        self.ready(function () {
          self[method].apply(self, args);
        });
        return true;
      }
      return false;
    },

    /**
     * Execute an array of callbacks functions.
     * @param {Array} callbacksArray
     * @param {Array} args
     */
    callbacks: function (callbacksArray, args) {
      for (var i = 0; i < callbacksArray.length; i++) {
        callbacksArray[i].apply(this, args);
      }
    },

    /**
     * Append cache token to url.
     * @param url
     * @returns {*}
     */
    urlToken: function (url) {
      var self = this;
      if (self.settings.cacheToken) {
        // Append ?
        url = url.indexOf('?') === -1 ? url + '?' : url;
        return url + '&' + self.settings.cacheToken;
      }
      return url;
    },

    /**
     * Add new collection loader to wjs.
     * It must be an instance of WjsLoader.
     * @param {string} name
     * @param {Object} methods
     * @param {boolean=} register True says to save as loaded extension.
     */
    loaderAdd: function (name, methods, register) {
      var self = this;
      // We can define loader with no specific method.
      methods = methods || {};
      if (!self.loaders[name]) {
        var className = 'WjsLoader' + name;
        // Add name to prototype.
        methods.type = name;
        // Allow to use custom base class.
        methods.classExtends = methods.classExtends || 'WjsLoader';
        self.classExtend(className, methods);
        self.loaders[name] = new (self.classProto(className))(name);
        self.extRequire[name] = {};
        // We have to deal between WjsLoader, instance of and jsLink,
        // wjs.extLoaded.WjsLoader must exists to save jsLink loader,
        // but jsLink loader is base constructor of WjsLoader, so it
        // have to be created before jsLink. wjs.extLoaded.WjsLoader
        // is present before WjsLoader creation.
        self.extLoaded[name] = self.extLoaded[name] || {};
        if (register) {
          // If register is set to true, we save loader as extension,
          // It is useful when loader is not created with WjsLoader,
          // like WjsLoader itself and basics ones.
          self.extLoaded.WjsLoader[name] = methods;
        }
      }
    },

    /**
     * Try to download all given loaders.
     * @param {Array} types
     * @param {Function} complete
     * @return {*}
     */
    loadersExists: function (types, complete) {
      var self = this, i = 0, use = [];
      // Search for existing loaders.
      for (; i < types.length; i++) {
        if (!self.loaders[types[i]]) {
          // If no active process found
          // we will make a new use process.
          use.push(types[i]);
        }
      }
      return (use.length > 0) ?
        // Create a new process.
        new (self.processProto)({WjsLoader: use}, {
          stacked: false,
          complete: complete
        }) :
        // Or execute callback.
        complete();
    },

    /**
     * Return process currently working
     * on the specified extension type.
     * @param {string} type
     * @param {string} name
     * @return {*}
     */
    processFor: function (type, name) {
      var self = this, i = 0, j;
      for (i = 0; i < self.processes.length; i++) {
        for (j = 0; j < self.processes[i].extRequests.length; j++) {
          if (self.processes[i].extRequests[j].type === type && self.processes[i].extRequests[j].name === name) {
            // We no longer check other types.
            return self.processes[i];
          }
        }
      }
    },

    /**
     * Load specified collection of specified type / name.
     * During the whole process we try to return loaded data if
     * no async method is launched.
     * @param {string} type
     * @param {string} name
     * @param {Object|Function=} options
     * @return {?}
     */
    use: function (request, options) {
      var self = this;
      if (this.readyDelay('use', arguments)) {
        return;
      }
      // Handle if request is just two strings.
      if (typeof request === 'string') {
        // Transform request to a multi request.
        var multiple = {};
        // User request as type, options as name.
        multiple[request] = [options];
        // Merge options.
        options = arguments[2];
        // Replace default var.
        request = multiple;
      }
      // Create a new process.
      return new (self.processProto)(request, options);
    },

    /**
     * Return data saved for one extension.
     * @param {string} type
     * @param {string} name
     * @return {?}
     */
    get: function (type, name) {
      var extList = this.extLoaded[type];
      // Return value if defined.
      // Use hasOwnProperty allow to save "undefined" for not found ext.
      return (extList && extList.hasOwnProperty(name)) ? extList[name] : false;
    },

    /**
     * Launch a destroying process.
     * A process pass trough loaders, and let them
     * manage the way to destroy extensions. It can
     * be asynchronous if loader ask for.
     * @param {string} type
     * @param {string} name
     * @param {?} options
     */
    destroy: function (type, name, options) {
      var self = this, request = {};
      if (this.readyDelay('destroy', arguments)) {
        return;
      }
      request[type] = [name];
      // Handle async destroy option.
      if (options && options.async) {
        delete options.async;
        self.window.setTimeout(function () {
          self.destroy(type, name, options);
        });
        return;
      }
      // Accept simple boolean value.
      options = typeof options === 'boolean' ? {dependencies: options} : options;
      // Convert callback to options object.
      options = self.extendOptions(options, {
        destroy: true
      });
      // Create a new process.
      return new (self.processProto)(request, options);
    },

    /**
     * Build destroy request with dependencies.
     * Avoid to delete core extensions.
     * @param {Object} request
     * @param {string} type
     * @param {string} name
     * @param {Object} options
     */
    destroyRequest: function (request, type, name, options) {
      var self = this;
      if ((type !== 'WjsLoader' ||
        (name !== 'WjsLoader' &&
          name !== 'JsLink' &&
          self.loadersBasic.indexOf(name) === -1))) {
        var require = self.extRequire[type] ? self.extRequire[type][name] : null,
          cacheRegName = type + '::' + name,
          cacheLink = self.cacheReg[cacheRegName];
        // Create queue entry if not exists.
        request[type] = request[type] || [];
        // Add item to destroy queue.
        request[type].push(name);
        // Remove cache response if exists.
        if (cacheLink) {
          // Add link to destroyed extensions.
          self.destroyRequest(request, 'CacheLink', cacheLink, options);
          // Remove entry.
          delete self.cacheReg[cacheRegName];
        }
        // Add requirements.
        if (require && options.dependencies) {
          self.regEach(require, function (requireType, requireName) {
            // Prevent to delete shared dependencies.
            if (!self.requireShared(type, name, requireType, requireName, request)) {
              self.destroyRequest(request, requireType, requireName, options);
            }
          });
        }
      }
    },

    /**
     * Return true if a extension is required by another one.
     * @param {string} type
     * @param {string} name
     * @param {string} requireType
     * @param {string} requireName
     * @return {boolean}
     */
    requireShared: function (baseType, baseName, requireType, requireName, except) {
      var self = this, shared = false;
      self.regEach(self.extRequire, function (type, name) {
        var require = self.extRequire[type][name];
        // Type is another one of sent arguments
        if (type !== baseType && name !== baseName &&
          // It contains the same dependency.
          require[requireType] && require[requireType].indexOf(requireName) !== -1 &&
          // It is not placed into exceptions.
          (!except || !except[type] || except[type].indexOf(name) === -1)) {
          // Save as shared.
          shared = true;
          // Stops iteration.
          return false;
        }
      });
      return shared;
    },

    /**
     * Iterates over the given objects list.
     * @param {object} registry
     * @param {Function} callback
     * @return {boolean}
     */
    regEach: function (registry, callback) {
      var self = this, i = 0, j, types = Object.keys(registry), names, result;
      for (; i < types.length; i++) {
        names = Array.isArray(registry[types[i]]) ? registry[types[i]] : Object.keys(registry[types[i]]);
        for (j = 0; j < names.length; j++) {
          if (callback.call(self, types[i], names[j]) === false) {
            return false;
          }
        }
      }
      return true;
    },

    /**
     * Remove item from given registry object list.
     * @param {Object} registry
     * @param {string} type
     * @param {string} name
     */
    regRem: function (registry, type, name) {
      delete registry[type][name];
      if (this.objectIsEmpty(registry[type])) {
        delete registry[type];
      }
    },

    /**
     * Get next item from registry object list.
     * @param {Object} registry
     * @return {*}
     */
    regNext: function (registry) {
      var registryKey = Object.keys(registry)[0],
        registryItemsKey;
      // Take first existing item.
      if (registryKey) {
        // Content can be an array of names,
        // or an object with names as indexes.
        registryItemsKey = Object.keys(registry[registryKey])[0];
        if (registryItemsKey) {
          // Return the type / name pair.
          return {
            type: registryKey,
            name: registryItemsKey,
            data: registry[registryKey][registryItemsKey]
          };
        }
      }
      return false;
    },

    /**
     * Simple AJAX request
     * @param {Object} options Contain various ajax options.
     */
    ajax: function (options) {
      options.method = options.method || 'GET';
      options.async = options.async || false;
      var self = this,
        xhr = new self.window.XMLHttpRequest();
      xhr.open(options.method, options.url, options.async);
      xhr.onreadystatechange = function () {
        // Process complete.
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            // Callback function specified.
            if (options.success && typeof options.success === 'function') {
              options.success(xhr);
            }
          }
          else {
            options.error(xhr);
          }
        }
      };
      if (options.method === 'POST') {
        xhr.setRequestHeader('Content-type',
          'application/x-www-form-urlencoded');
      }
      xhr.send(options.data ? self.param(options.data) : undefined);
    },

    /**
     * Transform object to URL query string.
     * @param {Object} object Query data in format {name:"value"}.
     * @return {string}
     */
    param: function (object) {
      var i, query = [], keys = Object.keys(object);
      for (i = 0; i < keys.length; i++) {
        query.push(keys[i] + '=' + object[keys[i]]);
      }
      return query.join('&');
    },

    /**
     * Minimal extend function for objects,
     * add items from one object to another one,
     * merge can be assigned, to merge objects only.
     */
    extendObject: function (object, add, mergeObjects) {
      var i = 0, keys = Object.keys(add), key;
      for (; i < keys.length; i++) {
        key = keys[i];
        if (!mergeObjects || typeof add[key] !== 'object') {
          object[key] = add[key];
        }
        else {
          // Create an empty entry if not exists.
          object[key] = object[key] || {};
          this.extendObject(object[key], add[key]);
        }
      }
      return object;
    },

    /**
     * Convert user passed options to object. Useful to protect when
     * function parameters could be : callback OR {complete:callback}.
     * @param {Object} options
     * @param {Object=} extra
     * @return {Object}
     */
    extendOptions: function (options, extra) {
      // Always turn option into an object.
      if (!options) {
        options = {};
      }
      // If options is a function, this is the "complete" callback.
      else if (typeof options === 'function') {
        options = {
          complete: options
        };
      }
      // No extra option defined.
      if (!extra) {
        return options;
      }
      // Merge extra function to object.
      return this.extendObject(options, this.extendOptions(extra));
    },

    /**
     * Add function to a prototype, caring about
     * setters and getters definitions.
     * @param {Object} object
     * @param {Object} add
     * @return {*}
     */
    extendProto: function (object, add) {
      var i, keys = Object.keys(add);
      for (i = 0; i < keys.length; i++) {
        Object.defineProperty(object, keys[i],
          Object.getOwnPropertyDescriptor(add, keys[i]));
      }
      return object;
    },

    /**
     * Return if object is empty or not,
     * useful to not have to count whole object length.
     * @param {Object} object
     * @return {boolean}
     */
    objectIsEmpty: function (object) {
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    },

    /**
     * Add definitions to an existing constructor.
     * @param {string} name
     * @param {Object} methods
     */
    classExtend: function (name, methods) {
      var self = this;
      if (self.classMethods[name]) {
        self.extendProto(self.classMethods[name], methods);
      }
      else {
        self.classMethods[name] = methods;
      }
    },

    /**
     * Return a new instance of required item.
     * @param {string} name Class name.
     * @return {Object} Prototype ready to be instantiated with "new".
     */
    classProto: function (name) {
      var self = this;
      // Base object is created once.
      if (!self.classProtos[name]) {
        // It may have base constructor send from server.
        var classExtends = false,
          WJSClassProto,
          base = Object,
          classMethod = self.classMethods[name];
        // Or is specified into prototype.
        classExtends = classMethod && classMethod.classExtends ?
          classMethod.classExtends : classExtends;
        if (classExtends) {
          base = self.classProto(classExtends);
        }
        // Create base object.
        WJSClassProto =
          // keep a internal copy.
          self.classProtos[name] = function () {
            var self = this;
            // All object generated by wjs has a constructor.
            return (self.__construct) ?
              self.__construct.apply(self, arguments) : null;
          };
        // Append base constructor.
        WJSClassProto.prototype = Object.create(base.prototype);
        // Adjust constructor to make instanceof works,
        self.extendObject(WJSClassProto.prototype, {
          constructor: base,
          className: name,
          wjs: self
        });
      }
      // Add extra method even constructor exists,
      // in case of prototype have been extended
      // after first constructor creation.
      if (self.classMethods[name]) {
        self.extendProto(
          self.classProtos[name].prototype,
          self.classMethods[name]
        );
      }
      return self.classProtos[name];
    },

    /**
     * Remove prototype definition to wjs.
     * @param {string} name
     */
    classProtoDestroy: function (name) {
      var self = this;
      if (self.classProtos[name]) {
        delete self.classProtos[name];
      }
      if (self.classMethods[name]) {
        delete self.classMethods[name];
      }
    },

    cacheHandle: function (extType, extName, data) {
      var self = this,
        handler = self.loaders[extType].cacheHandler[extName],
        buffer = self.cacheBuffer;
      // A cache link has called this method,
      // before than a script asked for the extension.
      // We store result for further use.
      if (!handler) {
        buffer[extType] = buffer[extType] || {};
        buffer[extType][extName] = data;
      }
      // The extension has been asked,
      // the process is waiting for the cache result.
      else {
        handler.cacheHandle(extType, extName, data);
      }
    },

    /**
     * Listen for the load event, limited
     * by a timeout, used to add callbacks to
     * dynamically added links like js and css.
     * @param {object} dom
     * @param {Function} callback
     */
    onload: function (dom, callback) {
      var loaded = false, callbackLauncher = function () {
        loaded = true;
        dom.removeEventListener('load', callbackLauncher);
        callback();
      };
      dom.addEventListener('load', callbackLauncher);
      // Protect load errors with a timeout.
      this.window.setTimeout(function () {
        if (!loaded) {
          callback();
        }
      }, 200);
    },

    /**
     * Thrown wjs specific error.
     * @param {string} message
     * @param {boolean=} fatal
     */
    err: function (message, fatal) {
      var self = this, errorPrefix = '[wjs error] : ';
      if (!fatal && self.window.console) {
        self.window.console.error(errorPrefix + message);
      }
      else {
        throw new self.window.Error(errorPrefix + message);
      }
    }
  };
  // Create global instance, using version number.
  context['wjs-' + wjsVersion] = new WJSProto();
  // Add global wjs only once.
  if (!context.wjs) {
    context.wjs = context['wjs-' + wjsVersion];
  }
  // [-->
}(window));
