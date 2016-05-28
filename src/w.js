(function (context) {
  'use strict';
  // <--]

  // Add a global wjsContext, used
  // by scripts links to access to w.
  context.wjsContext = context;

  /**
   * Shortcut function for w.
   * Wait for an "load" event on given object.
   */
  var onload = (callback, item, event = 'load') => {
    (item || context).addEventListener(event, callback);
  };

  /** @constructor */
  var W = function (options) {
    // If only a function sent, convert it to options.
    this.options = options = this.extendOptions(options);
    // Save wjs instance as global object.
    context[options.settings ? options.settings.clientName : 'wjs'] = this;
    // Execute init now, document is already loaded.
    if (this.document.readyState !== 'loading') {
      this.init();
    }
    // Defer execution after page load.
    else {
      this.window.addEventListener('DOMContentLoaded', this.init.bind(this));
    }
  };

  W.prototype = {

    // Can use various context type.
    context: context,
    // Fail on assumed global window object.
    window: context.window || window,
    // Fail on assumed window's document object.
    document: context.document || window.document,

    /**
     * Create basics elements to interact with the document.
     * Must be executed when document is ready.
     */
    init: function () {
      var self = this,
        options = self.options;
      // Create owned objects.
      self.extendObject(self, {
        /** @type {string} Override default headless version */
        version: options.settings ? options.settings.version : '[$version]-headless',
        /** @type {boolean} */
        readyComplete: false,
        /** @type {Object} */
        packageDefault: {},
        /** @type {Object} */
        loaders: {},
        /** @type {Array} */
        loadersBasic: [],
        /** @type {Object} */
        extLoaded: {WjsLoader: {}},
        /** @type {Object} */
        extRequire: {WjsLoader: {}},
        /** @type {Object} Raw methods */
        classMethods: {},
        /** @type {Object} Prototypes from methods */
        classProtos: {},
        /** @type {Object} */
        processes: {},
        /** @type {Number} */
        processCounter: 0,
        /** @type {Array} */
        stack: [],
        /** @type {Object} */
        stackCurrent: false,
        /** @type {Object} Store names of CacheLinks */
        cacheReg: {},
        /** @type {Object} */
        settings: {
          clientName: 'wjs',
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
      self.classExtend('WjsLoader', W.lib.Loader);
      self.classExtend('WjsProcess', W.lib.Process);
      // Create core loaders.
      self.loaderAdd('JsLink', W.retrieve('WjsLoader', 'JsLink'), true);
      self.loaderAdd('WjsLoader', W.retrieve('WjsLoader', 'WjsLoader'), true);
      // Create basic loaders who are required by package.
      for (var i = 0, type; type = self.loadersBasic[i++];) {
        self.loaderAdd(type, undefined, true);
      }
      // Execute a function asynchronously.
      // Or create a simple timeout.
      self.async = self.window.setTimeout.bind(self.window);
      // Bind function to wjs.
      self.trigger = W.trigger;
      // Load all other scripts then run ready functions.
      // Create a loading process to parse package content.
      self.use(null, {
        response: self.packageDefault,
        complete: function () {
          var callbacks = W.readyCallbacks[self.settings.clientName];
          // Mark as readyComplete, further ready functions
          // will be executed directly.
          self.readyComplete = true;
          // Execute complete function sent as argument.
          if (options.complete) {
            options.complete.call(self);
          }
          if (callbacks) {
            // Launch owned callbacks from base proto.
            self.callbacks(callbacks);
          }
        }
      });
    },

    /**
     * Execute an array of callbacks functions.
     */
    callbacks: function (callbacksArray, args, thisArg) {
      // Only use apply function in case of existing args,
      // call function if faster than apply, even with argument check.
      for (var method = args ? 'apply' : 'call', item, i = 0; item = callbacksArray[i++];) {
        item[method](thisArg || this, args);
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
        return (url.indexOf('?') === -1 ? url + '?' : url) +
            // Add token.
          '&' + cacheToken;
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
      return use.length ?
        // Create a new process.
        this.use({WjsLoader: use}, {
          stack: false,
          complete: complete
        }) :
        // Or execute callback.
        complete();
    },

    process: function (request, options) {
      // Create process.
      return new (this.classProto('WjsProcess'))(request, options, this);
    },

    /**
     * Load specified collection of specified type / name.
     * @param {Object} request
     * @param {Object|Function=} options
     * @return {?}
     */
    use: function (request, options) {
      var args = this.extendArgs(arguments);
      // Async by default.
      if (args[1]) {
        args[1].async = args[1].async !== false;
      }
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
      return extList && extList.hasOwnProperty(name) ? extList[name] : false;
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
      var self = this, args = self.extendArgs(arguments),
        request = args[0];
      options = args[1];
      // Accept simple boolean value.
      if (typeof options === 'boolean') {
        options = {};
      }
      // Convert callback to options object.
      options = self.extendObject({
        destroy: true,
        dependencies: arguments[1] === true || arguments[2] === true
      }, self.extendOptions(options));
      // Async false by default.
      options.async = options.async === true;
      // If request is mixed loaders and non loaders,
      // we have to destroy non loaders first, so
      // we split into two separated processes;
      if (request.WjsLoader && Object.keys(request).length > 1) {
        var requestLoaders = {WjsLoader: request.WjsLoader},
          optionsFirstPass = this.extendObject({}, options);
        // Override complete callback.
        optionsFirstPass.complete = function () {
          self.destroy(requestLoaders, options);
        };
        // Clear loaders from request.
        delete request.WjsLoader;
        // Launch non loaders destruction.
        return this.destroy(request, optionsFirstPass);
      }
      // Create a new process.
      return self.process(request, options);
    },

    extIsCore: function (type, name) {
      return type === 'WjsLoader' &&
        (name !== 'WjsLoader' || name !== 'JsLink' || this.loadersBasic.indexOf(name) !== -1);
    },

    requirementsDeletable: function (extensionType, extensionName) {
      var deletable = {}, requirements = this.extRequire[extensionType][extensionName];
      if (requirements) {
        this.regEach(requirements, function (requireType, requireName) {
          if ( // Do not delete core loaders
          !this.extIsCore(requireType, requireName) &&
            // or shared components.
          !this.requireShared(extensionType, extensionName, requireType, requireName, deletable)) {
            deletable[requireType] = deletable[requireType] || [];
            deletable[requireType].push(requireName);
          }
        });
      }
      return deletable;
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
      var i = 0, j, type, name, types = Object.keys(registry), names;
      while (type = types[i++]) {
        names = Array.isArray(registry[type]) ? registry[type] : Object.keys(registry[type]);
        for (j = 0; name = names[j++];) {
          if (callback.call(this, type, name) === false) {
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
        method = options.method || 'GET', success = options.success,
        url = options.url;
      // Create xhr.
      xhr.open(method,
        // On GET mode append data as query strings.
        method === 'GET' && data ? url + '?' + data : url,
        // Async by default.
        options.async !== undefined ? options.async : true);
      // Define callback.
      xhr.onreadystatechange = function () {
        // Process complete.
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            // Callback function specified.
            if (success && typeof success === 'function') {
              success(xhr);
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
     * @return {Object}
     */
    extendOptions: function (options) {
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
      return options;
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
      // Base methods are already defined.
      if (classMethods[name]) {
        // We add new methods to it.
        this.extendProto(classMethods[name], methods);
      }
      else {
        // This is the base methods.
        classMethods[name] = methods;
        // Save a reference to proto name.
        classMethods[name].protoClassName = name;
      }
      // Ask to rebuild prototype on next instance.
      delete this.classProtos[name];
    },

    /**
     * Return a new instance of required item.
     * @param {string} name Class name.
     * @return {Object} Prototype ready to be instantiated with "new".
     */
    classProto: function (name) {
      // Shortcuts.
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
        WJSClassProto.prototype.constructor = base;
        // Class name.
        WJSClassProto.prototype.className = name;
        // Reference to this.
        WJSClassProto.prototype.wjs = this;
        // Add extra method.
        if (classMethod) {
          this.extendProto(
            classProtos[name].prototype,
            classMethod
          );
        }
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
        if (!loaded) {
          loaded = true;
          dom.removeEventListener('load', localCallback);
          callback();
        }
      };
      dom.addEventListener('load', localCallback);
      // Protect load errors with a timeout.
      this.async(localCallback, 200);
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
  W.lib = {};
  W.reg = {};
  W.readyCallbacks = {};
  W.context = context;

  /**
   * Allow to store callback after page loads.
   * @param {string|function} clientName
   * @param {function=} callback Function executed on loading complete.
   */
  W.ready = function (clientName, callback) {
    var readyCallbacks = this.readyCallbacks;
    // Allow to store only callback.
    if (typeof clientName === 'function') {
      callback = clientName;
      clientName = 'wjs';
    }
    // Already complete.
    if (context[clientName] && context[clientName].readyComplete === true) {
      // Execute callback now.
      context[clientName].async(callback);
    }
    // Enqueue.
    else {
      readyCallbacks[clientName] = readyCallbacks[clientName] || [];
      readyCallbacks[clientName].push(callback);
    }
  };

  /**
   * Trigger a minimal custom event used
   * internally to listen for extension loads,
   * and javascript registering.
   */
  W.trigger = function (name, options, dom) {
    // Shortcut.
    var win = context.window,
    // Create.
      event = win.document.createEvent('CustomEvent');
    // Init, IE does not support undefined details.
    event.initCustomEvent(name, true, true, options || null);
    // Dispatch on window if no dom defined.
    (dom || win).dispatchEvent(event);
  };

  /**
   * Listen event only once.
   */
  W.listenOnce = function (eventName, callback) {
    var localCallback = function () {
      context.window.removeEventListener(eventName, localCallback);
      callback();
    };
    context.window.addEventListener(eventName, localCallback);
  };

  /**
   * Even registering elements has the same type / name
   * keys as extensions, it can be used, for example, by
   * an extension type to store various types / names
   * couples of data.
   */
  W.register = function (type, name, data) {
    var reg = this.reg;
    reg[type] = reg[type] || {};
    reg[type][name] = data;
    W.trigger(['wjsRegister', type, name].join('::'));
  };

  /**
   * Retrieve saved data.
   */
  W.retrieve = function (type, name) {
    var reg = this.reg;
    if (reg[type] && reg[type][name]) {
      return reg[type][name];
    }
    return false;
  };

  /**
   * Add a callback for given data registering.
   * @param type
   * @param name
   * @param callback
   */
  W.registerListen = function (type, name, callback) {
    var self = this, data = W.retrieve(type, name);
    if (data) {
      callback(data);
    }
    else {
      W.listenOnce('wjsRegister::' + type + '::' + name, function () {
        callback(self.reg[type][name]);
      });
    }
  };

  /**
   * Store cached data.
   */
  W.cache = function (extType, extName, data) {
    W.register('cache', extType + '/' + extName, data);
  };

  /**
   * Empty function to hold methods to override.
   */
  W._e = function () {
    // Nothing.
  };

  // Save global prototype.
  context.W = W;

  // Listen for page load.
  onload(() => {
    // Check if at least on instance of wjs
    // have been created, manually or by server init.
    if (!context.wjs) {
      new W();
    }
  }, context);
}(this));
