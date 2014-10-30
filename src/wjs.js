(function (context) {
  'use strict';
  // <--]
  var wjsVersion = '3.0.3', WJSProto;
  // Protect against multiple declaration.
  // Only one instance of this object is created per page.
  // Contain global javascript tools and helpers functions.
  if (context.wjs !== undefined && context.wjs.version === wjsVersion) {
    return;
  }

  /** @constructor */
  WJSProto = function () {
    this.extendObject(this, {
      window: context.window,
      document: context.document,
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
      extLoaded: {},
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
      settings: null,
      /** @type {Function} Shorthand */
      pull: this.extPull
    });
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
        // Create basic loaders who are required by package.
        for (var i = 0, length = self.loadersBasic.length; i < length; i++) {
          self.loaderAdd(self.loadersBasic[i]);
        }
        delete self.loadersBasic;
        // Load extensions loaders added before init.
        self.loaderBufferFlush();
        // Function is used only once.
        delete self.loaderBufferFlush;
        // Load all other scripts then run ready functions.
        // Execute startup functions.
        self.unpack(self.packageDefault, function () {
          // Execute all "ready" functions.
          var i, length;
          // Mark as readyComplete, further ready functions
          // will be executed directly.
          self.readyComplete = true;
          for (i = 0, length = self.readyCallbacks.length; i < length; i += 1) {
            self.readyCallbacks[i].call(self);
            // Callback useless.
            delete self.readyCallbacks[i];
          }
        });
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

    /**
     * Parse json data.
     * Used when data is not loaded by AJAX.
     * Basically as document startup.
     * @param {!Object} object
     * @param {function(...)} complete Callback executed on loading complete.
     */
    unpack: function (object, complete) {
      // Create a loading process to parse package content.
      new this.processProto(this.extendOptions(complete))
        // Directly treat object as response.
        .responseParse(object);
    },

    /**
     * Add new collection loader to wjs.
     * It must be an instance of WjsLoader.
     * @param {string} name
     * @param {Object} methods
     */
    loaderAdd: function (name, methods) {
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
        var className = 'WjsLoader' + self.upperCaseFirst(name);
        // Add name to prototype.
        methods.type = name;
        // Allow to use custom base class.
        methods.classExtends = methods.classExtends || 'WjsLoader';
        self.classExtend(className, methods);
        self.loaders[name] = new (self.classProto(className))(name);
        self.extLoaded[name] = {};
        self.extRequire[name] = {};
      }
    },

    /**
     * Return extensions loader.
     * @param {string} name
     * @return {WjsLoader}
     */
    loaderGet: function (name) {
      var self = this;
      if (!self.loaders[name]) {
        // We know that an extra loader is available remotely.
        if (self.loadersExtra.indexOf(name) !== -1) {
          self.extPull('wjsLoader', name);
        }
        // Extension definitively not exists.
        else {
          self.error('Undefined loader "' + name + '"');
        }
      }
      return self.loaders[name];
    },

    /**
     * Destroy loader object. Loaded content
     * by this loader are not affected.
     * @param {string} name
     */
    loaderDestroy: function (name) {
      var self = this;
      // Remove extension if exists.
      self.extDestroy('wjsLoader', name);
      // Remove prototype.
      self.classProtoDestroy('WjsLoader' + self.upperCaseFirst(name));
      delete self.loaders[name];
      delete self.extLoaded[name];
      delete self.extRequire[name];
    },

    /**
     * Add loaders declared before init().
     * They are stored into a temporary buffer.
     */
    loaderBufferFlush: function () {
      var loaderName,
        self = this,
        buffer = self.loadersBuffer;
      // This var will not be used anymore.
      delete self.loadersBuffer;
      // Create loaders prototypes.
      for (loaderName in buffer) {
        if (buffer.hasOwnProperty(loaderName)) {
          self.loaderAdd(loaderName, buffer[loaderName]);
        }
      }
    },

    /**
     * Load specified collection of specified type / name.
     * @param {string} type
     * @param {string} name
     * @param {Object|Function=} options
     * @return {?}
     */
    extPull: function (type, name, options) {
      var i, self = this,
        extensionData = self.extGet(type, name),
        processes = self.processes,
        length = processes.length;
      options = self.extendOptions(options) || {};
      options.async = options.async || (options.complete !== undefined);
      // Check if data is missing.
      if (!extensionData ||
        // Reload is allowed internally
        self.loaderGet(type).preventReload === false ||
        // Reload is forced by user.
        (options.reload === true)) {
        // First search if a process is not
        // currently waiting to parse extension.
        for (i = 0; i < length; i++) {
          if (processes[i].parseQ[type] &&
            processes[i].parseQ[type][name]) {
            // If found, enforce process to parse item now.
            processes[i].responseParseItem(type, name);
            return;
          }
        }
        // Item not found, we need to retrieve it.
        self.loaderGet(type).extLoad(name, options);
      }
      // Extension already loaded.
      // We have to execute callback manually.
      else if (options.complete) {
        options.complete(extensionData);
      }
      // Return data if exists, we can't guarantee
      // that data can be loaded, due to various loader
      // parse management, even async is false (ex, image loader).
      return self.extGet(type, name);
    },

    /**
     * Take an object of requested extensions.
     * @param {Object} object
     */
    extPullMultiple: function (object) {
      var extensionType, i;
      for (extensionType in object) {
        if (object.hasOwnProperty(extensionType)) {
          for (i = 0; i < arguments.length; i++) {
            this.extPull(extensionType, object[extensionType][i]);
          }
        }
      }
    },

    /**
     * Return data saved for one extension.
     * @param {string} type
     * @param {string} name
     * @return {?}
     */
    extGet: function (type, name) {
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
    extDestroy: function (type, name, withDependencies) {
      var self = this;
      if (self.extGet(type, name)) {
        var requirementType, i,
          require = self.extRequire[type][name];
        // Do not delete parent container for "type"
        // which is created by loader
        if (require && withDependencies) {
          for (requirementType in require) {
            if (require.hasOwnProperty(requirementType)) {
              for (i = 0; i < require[requirementType].length; i++) {
                self.extDestroy(requirementType, require[requirementType][i]);
              }
            }
          }
          delete self.extRequire[type][name];
        }
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
        xhr = new self.window.XMLHttpRequest(),
        event = self.document.createEvent('Event');
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
      event.initEvent('wjsAjaxCall', true, true);
      self.window.dispatchEvent(event);
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
      for (var i in add) {
        if (add.hasOwnProperty(i)) {
          Object.defineProperty(object, i,
            Object.getOwnPropertyDescriptor(add, i));
        }
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
     * First letter of a string to uppercase.
     * Use to generate class or hooks names.
     * @param {string} string
     * @return {string}
     */
    upperCaseFirst: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
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

    /**
     * Thrown wjs specific error.
     * @param {string} message
     * @param {boolean=} fatal
     */
    error: function (message, fatal) {
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
