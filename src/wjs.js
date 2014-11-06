// wJs v3.2.0 - (c) Romain WEEGER 2010 / 2014 - www.wexample.com | MIT and GPL licenses
(function (context) {
  'use strict';
  // <--]
  var wjsVersion = '3.2.0', WJSProto;
  // Protect against multiple declaration.
  // Only one instance of this object is created per page.
  // Contain global javascript tools and helpers functions.
  if (context.wjs !== undefined && context.wjs.version === wjsVersion) {
    return;
  }

  /** @constructor */
  WJSProto = function () {
    this.extendObject(this, {
      context: context,
      window: context.window || window,
      document: context.document || window.document,
      /** @type {string} */
      version: wjsVersion,
      /** @type Array.Function */
      readyCallbacks: [],
      /** @type {boolean} */
      readyComplete: false,
      /** @type {Object} */
      packageDefault: null,
      /** @type {Object.Object} */
      loaders: {},
      /** @type {Array.string} */
      loadersExtra: [],
      /** @type {Object.Object} */
      loadersBuffer: {},
      /** @type {Object.Object} */
      loadersBasic: {},
      /** @type {Object.Object.?} */
      extLoaded: {WjsLoader: {}},
      /** @type {Object.Array.string} */
      extRequire: {},
      /** @type {WJSProcessProto} Reference to prototype */
      processProto: null,
      /** @type {Array.WJSProcessProto} */
      processes: [],
      /** @type {Object.Function} */
      classProtos: {},
      /** @type {Object.Object} */
      classMethods: {},
      /** @type {Object} */
      settings: null
    });
    // Add a global wjsContext, use
    // by scripts links to access to wjs.
    this.context.wjsContext = context;
    // [VARS_MAP]
  };

  WJSProto.prototype = {

    /**
     * Create basics elements to interact with the document.
     * Must be executed when document is ready.
     */
    init: function (options) {
      var self = this;
      this.window.addEventListener('load', function () {
        // Apply options.
        self.extendObject(self, options);
        // Load extensions loaders added before init.
        var loaderName,
          buffer = self.loadersBuffer,
          bufferKeys = Object.keys(buffer), i;
        // This var will not be used anymore,
        // we have to remove it before empty the buffer.
        delete self.loadersBuffer;
        // Create loaders prototypes.
        for (i = 0; i < bufferKeys.length; i++) {
          self.loaderAdd(bufferKeys[i], buffer[bufferKeys[i]], true);
        }
        // Create basic loaders who are required by package.
        for (i = 0; i < self.loadersBasic.length; i++) {
          self.loaderAdd(self.loadersBasic[i], undefined, true);
        }
        delete self.loadersBasic;
        // Load all other scripts then run ready functions.
        // Execute startup functions.
        // Create a loading process to parse package content.
        new self.processProto({
          complete: function () {
            delete self.packageDefault;
            // Execute all "ready" functions.
            var i, length;
            // Mark as readyComplete, further ready functions
            // will be executed directly.
            self.readyComplete = true;
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
        callback();
      }
      else {
        this.readyCallbacks.push(callback);
      }
    },

    callbacks: function (callbacksArray, args) {
      for (var i = 0; i < callbacksArray.length; i++) {
        callbacksArray[i].apply(this, args);
      }
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
      // We can define loader with no special method.
      methods = methods || {};
      // If wjs is not ready to add loaders, we have
      // a temporary variable for loaders, it is removed
      // into wjs init function.
      if (self.loadersBuffer !== undefined) {
        self.loadersBuffer[name] = methods;
        return;
      }
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

    loadersExists: function (types, complete) {
      types = Array.isArray(types) ? types : [types];
      var self = this, i, exists = [], use = [];
      // Search for existing loaders.
      for (i = 0; i < types.length; i++) {
        if (!self.loaders[types[i]]) {
          if (self.loadersExtra.indexOf(types[i])) {
            use.push(types[i]);
          }
          else {
            // One loader do not exists at all.
            return false;
          }
        }
      }
      return (use.length > 0) ? this.use({WjsLoader: use}, complete) : complete();
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
      // Treat if request is just two strings.
      if (typeof request === 'string') {
        // Transform request to a multi request.
        var multiple = {};
        // User request as type, options as name.
        multiple[request] = [options];
        options = self.extendOptions(arguments[2], {
          mainType: request,
          mainName: options
        });
        // And maybe option exists as a third argument.
        return self.use(multiple, options);
      }
      // Make first a specific verification for loaders,
      // Use them if needed, loaders can't have
      return self.loadersExists(Object.keys(request), function () {
        // Loader exists, we can search for asked extension.
        // Transform callback to object, if not already one.
        options = self.extendOptions(options);
        var i, j, k, type, name, use, processQueued, types = Object.keys(request),
          process = new (self.processProto)(options),
          extensionData;
        // Iterates over requested types.
        for (i = 0; i < types.length; i++) {
          type = types[i];
          // Contain list of really missing extensions to retrieve.
          use = [];
          // Iterates over items
          for (j = 0; j < request[type].length; j++) {
            name = request[type][j];
            extensionData = self.get(type, name);
            // Check if data is missing.
            if (!extensionData ||
              // Reload is allowed internally
              self.loaders[type].preventReload === false ||
              // Reload is forced by user.
              options.reload === true) {
              // Search if a process is not currently
              // waiting to be parsed, and containing requested data,
              // in this case, current process will be delayed again.
              for (k = 0; k < self.processes.length; k++) {
                processQueued = self.processes[k];
                if (processQueued.parseQ[type] &&
                  processQueued.parseQ[type][name]) {
                  // We have found a non terminated process, we shut down this one.
                  process.loadingComplete(true);
                  // A process is about to parse requested extension,
                  // We enforce process to parse it now.
                  return processQueued.responseParseItem(type, name, function () {
                    // Launch request again.
                    return self.use(request, options);
                  });
                }
              }
              // Item not found, we need to retrieve it.
              use.push(name);
            }
          }
          // We hook loaders to add request(s).
          self.loaders[type].extRequestInit(use, process, options);
        }
        // We start process.
        process.loadingStart();
        if (options.mainType) {
          // Return data if exists,
          // If only async process and parsing as been asked
          // and retrieved, or if extension have been already loaded,
          // there is a chance that content can be return, otherwise
          // user should have conscience of type of content he manipulates.
          return self.get(options.mainType, options.mainName);
        }
      });
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
     * @param {string} type
     * @param {string} name
     * @param {boolean=} withDependencies
     */
    destroy: function (type, name, withDependencies) {
      var self = this;
      if (self.get(type, name)) {
        var requirementType, i,
          require = self.extRequire[type][name];
        // Do not delete parent container for "type"
        // which is created by loader
        if (require && withDependencies) {
          for (requirementType in require) {
            if (require.hasOwnProperty(requirementType)) {
              for (i = 0; i < require[requirementType].length; i++) {
                self.destroy(requirementType, require[requirementType][i]);
              }
            }
          }
          delete self.extRequire[type][name];
        }
        // Hook loader.
        self.loaders[type].extDestroy(name, self.extLoaded[type][name]);
        self.loaders[type].destroy(name, self.extLoaded[type][name]);
        delete self.extLoaded[type][name];
      }
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
      this.trigger('wjsXhr');
      xhr.send(self.param(options.data));
    },

    /**
     * Transform object to URL query string.
     * @param {Object} object Query data in format {name:"value"}.
     * @return {string}
     */
    param: function (object) {
      var i, query = [];
      for (i in object) {
        if (object.hasOwnProperty(i)) {
          query.push(i + '=' + object[i]);
        }
      }
      return query.join('&');
    },

    /**
     * Minimal extend function for objects,
     * add items from one object to another one,
     */
    extendObject: function (object, add) {
      var i;
      for (i in add) {
        if (add.hasOwnProperty(i)) {
          object[i] = add[i];
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
          wjs: this
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

    trigger: function (eventName) {
      var event = this.document.createEvent('Event');
      event.initEvent(eventName, true, true);
      this.window.dispatchEvent(event);
    },

    /**
     * Thrown wjs specific error.
     * @param {string} message
     * @param {boolean=} fatal
     */
    err: function (message, fatal) {
      var errorPrefix = '[wjs error] : ';
      if (!fatal && this.window.console) {
        this.window.console.error(errorPrefix + message);
      }
      else {
        throw new Error(errorPrefix + message);
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
