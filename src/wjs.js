(function (context) {
  'use strict';
  // <--]
  var wjsVersion = '[$version]-headless', WjsProto;

  // Add a global wjsContext, use
  // by scripts links to access to wjs.
  context.wjsContext = context;

  /** @constructor */
  WjsProto = function (options) {
    // Of only a function sent, convert it to options.
    this.options = options = this.extendOptions(options);
    // Save wjs instance as global object.
    context[options.settings ? options.settings.clientName : 'wjs'] = this;
    // Execute init now, document is already loaded.
    if (context.window.document.readyState !== 'loading') {
      this.init();
    }
    // Defer execution after page load.
    else {
      context.window.addEventListener('load', this.init.bind(this));
    }
  };

  WjsProto.prototype = {

    /**
     * Create basics elements to interact with the document.
     * Must be executed when document is ready.
     */
    init: function () {
      var self = this,
        WjsProtoLocal = WjsProto,
        options = self.options;
      // Create owned objects.
      self.extendObject(self, {
        context: context,
        window: context.window || window,
        document: context.document || window.document,
        /** @type {string} Override headless version */
        version: (options.settings ? options.settings.version : wjsVersion),
        /** @type {boolean} */
        readyComplete: false,
        /** @type {Object} */
        packageDefault: {},
        /** @type {Object} */
        loaders: {},
        /** @type {Array} */
        loadersExtra: [],
        /** @type {Array} */
        loadersBasic: [],
        /** @type {Object} */
        extLoaded: {WjsLoader: {}},
        /** @type {Object} */
        extRequire: {},
        /** @type {Array} */
        processes: [],
        /** @type {Number} */
        processCounter: 0,
        /** @type {Array} */
        processStack: [],
        /** @type {Array} */
        processParent: undefined,
        /** @type {Object} */
        classProtos: {},
        /** @type {Object} */
        classMethods: {},
        /** @type {Object} Store names of CacheLinks */
        cacheReg: {},
        /** @type {Object} */
        settings: {
          clientName: '',
          paramExtra: '',
          paramInc: '',
          paramExc: '',
          paramToken: '',
          pathResponse: '',
          cacheToken: ''
        }
      });
      // Apply options.
      self.extendObject(self, options);
      // Create prototypes instances.
      self.classExtend('WjsLoader', WjsProtoLocal.proto.Loader);
      self.classExtend('WjsProcess', WjsProtoLocal.proto.Process);
      // Create core loaders.
      self.loaderAdd('JsLink', WjsProtoLocal.retrieve('WjsLoader', 'JsLink'), true);
      self.loaderAdd('WjsLoader', WjsProtoLocal.retrieve('WjsLoader', 'WjsLoader'), true);
      // Create basic loaders who are required by package.
      for (var i = 0; i < self.loadersBasic.length; i++) {
        self.loaderAdd(self.loadersBasic[i], undefined, true);
      }
      // Load all other scripts then run ready functions.
      // Create a loading process to parse package content.
      self.process(null, {
        complete: function () {
          // Mark as readyComplete, further ready functions
          // will be executed directly.
          self.readyComplete = true;
          if (options.complete) {
            options.complete.call(self);
          }
          self.callbacks(WjsProtoLocal.readyCallbacks[self.settings.clientName] || []);
        }
        // Directly treat object as response.
      }).responseParse(self.packageDefault);
    },

    /**
     * Execute an array of callbacks functions.
     * @param {Array} callbacksArray
     * @param {Array=} args
     */
    callbacks: function (callbacksArray, args) {
      // Only use apply function in case of existing args,
      // call function if faster than apply, event with argument check.
      var method = args ? 'apply' : 'call';
      for (var i = 0; i < callbacksArray.length; i++) {
        callbacksArray[i][method](this, args);
      }
    },

    /**
     * Append cache token to url.
     * @param url
     * @returns {*}
     */
    urlToken: function (url) {
      var cacheToken = this.settings.cacheToken;
      if (cacheToken) {
        // Append ?
        return (url.indexOf('?') === -1 ? url + '?' : url)
          // Add token.
          + '&' + cacheToken;
      }
      return url;
    },

    /**
     * Add new collection loader to wjs.
     * It must be an instance of WjsLoader.
     * @param {string} name
     * @param {Object} methods
     * @param {boolean=} register True says to save as loaded extension.
     * @param {Function=} callback
     */
    loaderAdd: function (name, methods, register, callback) {
      var self = this, className = 'WjsLoader' + name;
      // We can define loader with no specific method.
      methods = methods || {};
      if (!self.loaders[name]) {
        // Add name to prototype.
        methods.type = name;
        // Allow to use custom base class.
        methods.classExtends = 'WjsLoader' + (methods.loaderExtends || '');
        // In case of class extension we have to check
        // if parent loader class exists.
        if (methods.loaderExtends) {
          self.loadersExists([methods.loaderExtends], function () {
            self.loaderBuild(name, className, methods, register, callback);
          });
          return;
        }
        self.loaderBuild(name, className, methods, register, callback);
      }
    },

    /**
     * Complete function for loaderAdd only.
     * @param {string} name
     * @param {string} className
     * @param {Object} methods
     * @param {boolean=} register True says to save as loaded extension.
     * @param {Function=} callback
     */
    loaderBuild: function (name, className, methods, register, callback) {
      this.classExtend(className, methods);
      this.loaders[name] = new (this.classProto(className))(name);
      this.extRequire[name] = {};
      var extLoaded = this.extLoaded;
      // We have to deal between WjsLoader, instance of and jsLink,
      // wjs.extLoaded.WjsLoader must exists to save jsLink loader,
      // but jsLink loader is base constructor of WjsLoader, so it
      // have to be created before jsLink. wjs.extLoaded.WjsLoader
      // is present before WjsLoader creation.
      extLoaded[name] = extLoaded[name] || {};
      if (register) {
        // If register is set to true, we save loader as extension,
        // It is useful when loader is not created with WjsLoader,
        // asz normal extension, like WjsLoader itself and basics ones.
        extLoaded.WjsLoader[name] = methods;
      }
      if (callback) {
        callback();
      }
    },

    /**
     * Try to download all given loaders.
     * @param {Array} types
     * @param {Function} complete
     * @return {*}
     */
    loadersExists: function (types, complete) {
      var i = 0, use = [], type;
      // Search for existing loaders.
      while (type = types[i++]) {
        // Loader not found.
        if (!this.loaders[type]) {
          use.push(type);
        }
      }
      return (use.length > 0) ?
        // Create a new process.
        this.process({
          WjsLoader: use
        }, {
          stacked: false,
          complete: complete
        }) :
        // Or execute callback.
        complete();
    },

    process: function (request, options) {
      return new (this.classProto('WjsProcess'))(request, options, this);
    },

    /**
     * Return process currently working
     * on the specified extension type.
     * @param {string} type
     * @param {string} name
     * @return {*}
     */
    processFor: function (type, name) {
      var i = 0, process, j, request, processes = this.processes;
      while (process = processes[i++]) {
        for (j = 0; request = process.extRequests[j++];) {
          if (request.type === type && request.name === name) {
            // We no longer check other types.
            return process;
          }
        }
      }
    },

    /**
     * Load specified collection of specified type / name.
     * @param {Object} request
     * @param {Object|Function=} options
     * @return {?}
     */
    use: function (request, options) {
      var args = this.extendArgs(arguments);
      // Create a new process.
      return this.process(args[0], args[1]);
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
      // Use hasOwnProperty allow to save "undefined"
      // for not found extensions.
      return (extList && extList.hasOwnProperty(name)) ? extList[name] : false;
    },

    /**
     * Launch a destroying process.
     * A process pass trough loaders, and let them
     * manage the way to destroy extensions. It can
     * be asynchronous if loader ask for.
     * @param {string|object} type
     * @param {string=} name
     * @param {?} options
     */
    destroy: function (type, name, options) {
      var self = this, args;
      // Handle async destroy option.
      if (options && options.async) {
        delete options.async;
        self.window.setTimeout(function () {
          self.destroy(type, name, options);
        });
        return null;
      }
      args = self.extendArgs(arguments);
      // Accept simple boolean value.
      if (typeof args[1] === 'boolean') {
        args[1] = {};
      }
      // Convert callback to options object.
      options = self.extendOptions({
        destroy: true,
        dependencies: (arguments[1] === true || arguments[2] === true)
      }, args[1]);
      // Create a new process.
      return self.process(args[0], options);
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
     * @param {string} baseType
     * @param {string} baseName
     * @param {string} requireType
     * @param {string} requireName
     * @param {Object} except
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
      var self = this, i = 0, j, types = Object.keys(registry), names;
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
      var xhr = new this.window.XMLHttpRequest(),
        data = options.data ? this.param(options.data) : undefined,
        method = options.method || 'GET',
        url = options.url;
      // Create xhr.
      xhr.open(method,
        // On GET mode append data as query strings.
        (method === 'GET' && data) ? url + '?' + data : url,
        // Async by default.
        options.async !== undefined ? options.async : true);
      // Define callback.
      xhr.onreadystatechange = function () {
        // Process complete.
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            // Callback function specified.
            if (options.success && typeof options.success === 'function') {
              options.success(xhr);
            }
          }
          else if (options.error) {
            options.error(xhr);
          }
        }
      };
      // Requested headers.
      if (method === 'POST') {
        xhr.setRequestHeader('Content-type',
          'application/x-www-form-urlencoded');
      }
      // Lets go.
      xhr.send(data);
    },

    /**
     * Transform object to URL query string.
     * @param {Object} object Query data in format {name:"value"}.
     * @return {string}
     */
    param: function (object) {
      var i = 0, query = [], key, keys = Object.keys(object);
      while (key = keys[i++]) {
        query.push(key + '=' + object[key]);
      }
      return query.join('&');
    },

    /**
     * Minimal extend function for objects,
     * add items from one object to another one,
     * merge can be assigned, to merge objects only.
     */
    extendObject: function (object, add, mergeObjects) {
      var i = 0, key, keys = Object.keys(add), addItem;
      while (key = keys[i++]) {
        addItem = add[key];
        if (!mergeObjects || typeof addItem !== 'object' || addItem === null) {
          object[key] = addItem;
        }
        else {
          // Create an empty entry if not exists.
          object[key] = object[key] || (Array.isArray(addItem) ? [] : {});
          this.extendObject(object[key], addItem);
        }
      }
      return object;
    },

    /**
     * Transform arguments like (type, name, options)
     * Into wjs request ({type:name}, options).
     * @param args
     * @returns {*[]}
     */
    extendArgs: function (args) {
      var request = args[0], options = args[1], multiple = {};
      // Handle if request is just two strings.
      if (typeof request === 'string') {
        // Transform request to a multi request.
        // User request as type, options as name.
        multiple[request] = [options];
        // Replace default var.
        request = multiple;
        // Merge options.
        options = args[2];
      }
      return [request, options];
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
      var i = 0, obj = Object, item, keys = obj.keys(add);
      while (item = keys[i++]) {
        obj.defineProperty(object, item,
          obj.getOwnPropertyDescriptor(add, item));
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
      var classMethods = this.classMethods;
      if (classMethods[name]) {
        this.extendProto(classMethods[name], methods);
      }
      else {
        classMethods[name] = methods;
      }
    },

    /**
     * Return a new instance of required item.
     * @param {string} name Class name.
     * @return {Object} Prototype ready to be instantiated with "new".
     */
    classProto: function (name) {
      var classProtos = this.classProtos,
        classMethod = this.classMethods[name];
      // Base object is created once.
      if (!classProtos[name]) {
        // It may have base constructor send from server.
        var classExtends,
          WJSClassProto,
          base = Object;
        // Or is specified into prototype.
        classExtends = classMethod && classMethod.classExtends ?
          classMethod.classExtends : false;
        if (classExtends) {
          base = this.classProto(classExtends);
        }
        // Create base object.
        WJSClassProto =
          // keep a internal copy.
          classProtos[name] = function () {
            var construct = this.__construct;
            // All object generated by wjs has a constructor.
            if (construct) {
              // Save performance by using apply only if
              // arguments are passed to constructor.
              if (arguments.length) {
                construct.apply(this, arguments);
              }
              else {
                construct.call(this);
              }
            }
          };
        // Append base constructor.
        WJSClassProto.prototype = Object.create(base.prototype);
        // Adjust constructor to make instanceof works,
        this.extendObject(WJSClassProto.prototype, {
          constructor: base,
          className: name,
          wjs: this
        });
      }
      // Add extra method even constructor exists,
      // in case of prototype have been extended
      // after first constructor creation.
      if (classMethod) {
        this.extendProto(
          classProtos[name].prototype,
          classMethod
        );
      }
      return classProtos[name];
    },

    /**
     * Remove prototype definition to wjs.
     * @param {string} name
     * @param {boolean=} keepMethods
     */
    classProtoDestroy: function (name, keepMethods) {
      var classProtos = this.classProtos,
        classMethods = this.classMethods;
      if (classProtos[name]) {
        delete classProtos[name];
      }
      if (!keepMethods && classMethods[name]) {
        delete classMethods[name];
      }
    },

    /**
     * Listen for the load event, limited by a timeout,
     * used to add callbacks to dynamically added links
     * like js and css.
     * @param {object} dom
     * @param {Function} callback
     */
    onload: function (dom, callback) {
      var loaded = false, localCallback = function () {
        loaded = true;
        dom.removeEventListener('load', localCallback);
        callback();
      };
      dom.addEventListener('load', localCallback);
      // Protect load errors with a timeout.
      this.window.setTimeout(function () {
        if (!loaded) {
          localCallback();
        }
      }, 200);
    },

    /**
     * Thrown wjs specific error.
     * @param {string} message
     * @param {boolean=} fatal
     */
    err: function (message, fatal) {
      var console = this.window.console,
        errorPrefix = '[' + this.settings.clientName + ' error] : ';
      if (!fatal && console) {
        console.error(errorPrefix + message);
      }
      else {
        throw new this.window.Error(errorPrefix + message);
      }
    }
  };
  // Handle core prototypes.
  WjsProto.proto = {};
  WjsProto.common = {};
  WjsProto.WjsLoader = {};
  WjsProto.readyCallbacks = {};
  WjsProto.context = context;

  /**
   * Allow to store callback after page loads.
   * @param {string|function} clientName
   * @param {function=} callback Function executed on loading complete.
   */
  WjsProto.ready = function (clientName, callback) {
    var readyCallbacks = this.readyCallbacks;
    // Allow to store only callback.
    if (typeof clientName === 'function') {
      callback = clientName;
      clientName = 'wjs';
    }
    if (context[clientName] && context[clientName].readyComplete === true) {
      // Execute callback asynchronously.
      // IE need function wrap.
      context[clientName].window.setTimeout(function () {
        callback();
      });
    }
    else {
      readyCallbacks[clientName] = readyCallbacks[clientName] || [];
      readyCallbacks[clientName].push(callback);
    }
  };

  /**
   * Trigger a custom event on a dom element.
   * Used by wjs to listen for extension loads,
   * and javascript registering.
   * @param name
   * @param domElement
   */
  WjsProto.event = function (name, domElement) {
    var event, doc = context.window.document;
    if (doc.createEvent) {
      event = doc.createEvent('HTMLEvents');
      event.initEvent(name, true, true);
      event.eventName = name;
      domElement.dispatchEvent(event);
    }
    // IE
    else {
      event = doc.createEventObject();
      event.eventType =
        event.eventName = name;
      domElement.fireEvent('on' + name, event);
    }
  };

  /**
   * Even registering elements has the same type / name
   * keys as extensions, it can be used, for example, by
   * an extension type to store various types / names
   * couples of data.
   */
  WjsProto.register = function (type, name, data) {
    var common = this.common;
    common[type] = common[type] || {};
    common[type][name] = data;
    WjsProto.event('wjsRegister::' + type + '::' + name, context.window);
  };

  /**
   * Retrieve saved data.
   */
  WjsProto.retrieve = function (type, name) {
    var common = this.common;
    if (common[type] && common[type][name]) {
      return common[type][name];
    }
    return false;
  };

  /**
   * Add a callback for given data registering.
   * @param type
   * @param name
   * @param callback
   */
  WjsProto.registerListen = function (type, name, callback) {
    var self = this, data = WjsProto.retrieve(type, name);
    if (data) {
      callback(data);
    }
    else {
      var eventName = 'wjsRegister::' + type + '::' + name,
        localCallback = function () {
          context.window.removeEventListener(eventName, localCallback);
          callback(self.common[type][name]);
        };
      context.window.addEventListener(eventName, localCallback);
    }
  };

  /**
   * Store cached data.
   */
  WjsProto.cache = function (extType, extName, data) {
    WjsProto.register('cache', extType + '/' + extName, data);
  };

  // Save global prototype.
  context.WjsProto = WjsProto;
  // [-->
}(this));
